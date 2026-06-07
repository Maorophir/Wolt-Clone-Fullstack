# 1. Base image: Using a lightweight Node.js environment
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only package files first to leverage Docker's caching mechanism
COPY package*.json ./

# 4. Install the dependencies
RUN npm install

# 5. Copy the rest of the React application code into the container
COPY . .

# 6. Expose the port that the React development server uses by default
EXPOSE 3000

# 7. Start the React development server
CMD ["npm", "start"]