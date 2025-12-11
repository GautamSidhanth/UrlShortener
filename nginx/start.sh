#!/bin/bash

# Default to "example.com" if not set, to prevent errors, 
# although the user should set this in .env
DOMAIN=${DOMAIN:-example.com}
EMAIL=${EMAIL:-admin@example.com}

# Directory where we will symlink the active certificates for Nginx to use
# This allows us to switch between dummy and real certs without changing nginx.conf
SSL_DIR="/etc/nginx/ssl"
mkdir -p "$SSL_DIR"

# Directory for Let's Encrypt live certs
LE_DIR="/etc/letsencrypt/live/$DOMAIN"

echo "--- Starting Nginx Setup for domain: $DOMAIN ---"

# Function to link dummy certs
link_dummy_certs() {
    echo "Linking dummy certificates..."
    ln -sf /etc/nginx/dummy-fullchain.pem "$SSL_DIR/fullchain.pem"
    ln -sf /etc/nginx/dummy-privkey.pem "$SSL_DIR/privkey.pem"
}

# Function to link real certs
link_real_certs() {
    echo "Linking real Let's Encrypt certificates..."
    ln -sf "$LE_DIR/fullchain.pem" "$SSL_DIR/fullchain.pem"
    ln -sf "$LE_DIR/privkey.pem" "$SSL_DIR/privkey.pem"
}

# 1. Generate dummy self-signed certificates (always needed for safety fallback)
if [ ! -f /etc/nginx/dummy-fullchain.pem ]; then
    echo "Generating dummy self-signed certificates..."
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout /etc/nginx/dummy-privkey.pem \
        -out /etc/nginx/dummy-fullchain.pem \
        -subj "/CN=localhost"
fi

# 2. Decide which certs to use initially
if [ -d "$LE_DIR" ] && [ -f "$LE_DIR/fullchain.pem" ]; then
    echo "Found existing Let's Encrypt certificates."
    link_real_certs
else
    echo "No existing Let's Encrypt certificates found."
    link_dummy_certs
fi

# 3. Start Nginx in background
echo "Starting Nginx..."
nginx -g "daemon on;"
NGINX_PID=$!

# 4. Request real certificates if they don't exist
if [ ! -d "$LE_DIR" ]; then
    echo "Requesting new certificates for $DOMAIN..."
    
    # Wait for Nginx to start
    sleep 5

    certbot certonly --webroot -w /var/www/html \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --text

    if [ $? -eq 0 ]; then
        echo "Certificate obtained successfully!"
        link_real_certs
        echo "Reloading Nginx..."
        nginx -s reload
    else
        echo "Certbot failed. Nginx will continue running with dummy certs."
        echo "Check your DOMAIN and ensure DNS points to this server IP."
    fi
fi

# 5. Start auto-renewal loop in background
(
    while :; do
        echo "Checking for renewal (every 12 hours)..."
        sleep 12h
        certbot renew --webroot -w /var/www/html --deploy-hook "nginx -s reload"
    done
) &

# Wait for Nginx
wait $NGINX_PID
