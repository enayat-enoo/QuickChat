# server/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (cached layer — only rebuilds on package.json change)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create metrics directory — volume mount will overlay this at runtime
RUN mkdir -p /app/metrics

EXPOSE 8000

CMD ["node", "server.js"]