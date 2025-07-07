# Use an official Node runtime as the parent image
# Trigger new build - 2025-07-07 - Testing with updated service account permissions
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Define build arguments
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_NOTIFICATION_BASE_URL
ARG REACT_APP_AI_SEARCH_BASE_URL

# Set environment variables
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_NOTIFICATION_BASE_URL=$REACT_APP_NOTIFICATION_BASE_URL
ENV REACT_APP_AI_SEARCH_BASE_URL=$REACT_APP_AI_SEARCH_BASE_URL

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
