# 1. Base image: Node.js for running Expo/Metro bundler
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only package files first to leverage Docker's caching mechanism
COPY package*.json ./

# 4. Install the dependencies
RUN npm install

# 5. Copy the rest of the React Native application code into the container
COPY . .

# 6. Expose the Expo Metro bundler port
EXPOSE 8081

# 7. Start the Expo development server in LAN mode
CMD ["npx", "expo", "start", "--lan", "-c"]
