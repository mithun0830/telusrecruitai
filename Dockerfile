# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/build ./build

# Copy server files and package.json
COPY server.js package.json ./

# Install production dependencies
RUN npm install --only=production

# Start the server
CMD ["node", "server.js"]
