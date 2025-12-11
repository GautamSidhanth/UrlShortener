FROM nginx:stable-alpine

# Install Certbot, OpenSSL, and Bash
RUN apk add --no-cache certbot certbot-nginx openssl bash

# Clear default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh

# Make script executable
RUN chmod +x /start.sh

# Create necessary directories
RUN mkdir -p /var/www/html /etc/nginx/ssl

# Expose HTTP and HTTPS
EXPOSE 80 443

CMD ["/start.sh"]