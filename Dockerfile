FROM node:22.14.0

# Install curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /sharon

# Copy package files first for better Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Sharon test files
COPY . .

# Make scripts executable
RUN chmod +x *.js *.sh 2>/dev/null || true

# Default command (overridden by docker-compose)
CMD ["tail", "-f", "/dev/null"]