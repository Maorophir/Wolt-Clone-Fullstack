# Use an official Node.js lightweight image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the application source code into the container
COPY src/ ./src/

# Expose the web server port
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]