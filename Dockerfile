# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

<<<<<<< HEAD
# Copy the rest of the application code
=======
# Copy source code
>>>>>>> stagging
COPY . .

# Build the application
RUN npm run build

<<<<<<< HEAD
# Install serve to run the application
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD ["serve", "-s", "build", "-l", "3001"]
=======
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
>>>>>>> stagging
