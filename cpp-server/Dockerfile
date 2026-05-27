# Use the latest Ubuntu image as the base
FROM ubuntu:latest

# Install necessary build tools and dependencies, including CMake and Google Test
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgtest-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Compile and install Google Test library
RUN cd /usr/src/gtest && cmake . && make && cp lib/*.a /usr/lib

# Set the working directory inside the container
WORKDIR /app

# Copy the source code and CMake configuration into the container
COPY src ./src/
COPY CMakeLists.txt .

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Create a build directory, configure the project with CMake, and compile everything
# This will build both the main app (WoltProject) and the unit tests
RUN mkdir build && cd build && \
    cmake .. && \
    make

# EX2 UPDATE: Document that the server listens on port 5555
EXPOSE 5555

# Expose the data directory as a volume for persistence
VOLUME ["/app/data"]

# Specify the command to run the main application with the default port 5555
CMD ["./build/WoltProject", "5555"]