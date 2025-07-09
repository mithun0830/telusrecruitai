# Use an official Node runtime as the parent image
FROM node:16-slim

# Set the working directory in the container
WORKDIR /app

# Define build arguments
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_NOTIFICATION_BASE_URL
ARG REACT_APP_AI_SEARCH_BASE_URL

# Set environment variables with default values that can be overridden
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_NOTIFICATION_BASE_URL=${REACT_APP_NOTIFICATION_BASE_URL}
ENV REACT_APP_AI_SEARCH_BASE_URL=${REACT_APP_AI_SEARCH_BASE_URL}

# Print environment variables during build (for debugging)
RUN echo "API_BASE_URL: $REACT_APP_API_BASE_URL" && \
    echo "NOTIFICATION_BASE_URL: $REACT_APP_NOTIFICATION_BASE_URL" && \
    echo "AI_SEARCH_BASE_URL: $REACT_APP_AI_SEARCH_BASE_URL"

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD ["serve", "-s", "build", "-l", "3001"]
