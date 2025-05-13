# Use node image
FROM node:21-slim

# Create app directory
WORKDIR /app

# Install native dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with npm
RUN npm install

# Copy source
COPY . .

# Create required directories
RUN mkdir -p public/uploads && chmod -R 755 public/uploads

# Rebuild native module before switching user
RUN npm rebuild better-sqlite3

# Optional: migrate and seed before switching to non-root user
RUN npm run migrate && npm run seed

# Add non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000

CMD ["npm", "run", "start:prod"]
