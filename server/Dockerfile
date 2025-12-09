# Use Debian-based Node (BEST for native modules like zookeeper)
FROM node:22-bullseye-slim

WORKDIR /usr/src/server

# Install build tools for node-gyp
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential g++ make \
  && rm -rf /var/lib/apt/lists/*

# Copy package files first
COPY package*.json ./

# Install dependencies (this will build zookeeper native module successfully)
RUN npm install

# Copy the rest of the source code
COPY . .

# Start server
CMD ["npm", "run", "start"]
