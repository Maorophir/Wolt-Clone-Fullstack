cmake_minimum_required(VERSION 3.14)
project(WoltProject)

# ==========================================
# 1. Configuration & Settings
# ==========================================
# Use C++17 for all targets in this project.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Threading support.
set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)

# Opt-in ThreadSanitizer build:  cmake -DENABLE_TSAN=ON ..
option(ENABLE_TSAN "Build with ThreadSanitizer" OFF)
if (ENABLE_TSAN)
    message(STATUS "ThreadSanitizer enabled")
    add_compile_options(-fsanitize=thread -g -O1 -fno-omit-frame-pointer)
    add_link_options(-fsanitize=thread)
endif()

# Opt-in AddressSanitizer build:  cmake -DENABLE_ASAN=ON ..
option(ENABLE_ASAN "Build with AddressSanitizer" OFF)
if (ENABLE_ASAN)
    message(STATUS "AddressSanitizer enabled")
    add_compile_options(-fsanitize=address,undefined -g -O1 -fno-omit-frame-pointer)
    add_link_options(-fsanitize=address,undefined)
endif()


# Testing support.
enable_testing()
find_package(GTest REQUIRED)

# ==========================================
# 2. Include Directories
# ==========================================
# Make the src tree available for quoted includes.
include_directories(
        ${GTEST_INCLUDE_DIRS}
        src
        src/interfaces
        src/commands
        src/command_parser
        src/data_management
        src/network
        src/recommendation
)

# ==========================================
# 3. Source Files Definitions
# ==========================================

# --- CORE SOURCES ---
set(CORE_SOURCES
        src/network/TCPServer.cpp
        src/network/ThreadPool.cpp
        src/commands/PostCommand.cpp
        src/commands/HelpCommand.cpp
        src/commands/GetCommand.cpp
        src/commands/PatchCommand.cpp
        src/commands/DeleteCommand.cpp
        src/command_parser/CommandParser.cpp
        src/data_management/StorageManager.cpp
        src/recommendation/RecommendationEngine.cpp
        src/recommendation/StoredRecommendationEngine.cpp
)

# --- TEST SOURCES ---
set(TEST_SOURCES
        src/tests/test_main.cpp
        src/tests/TCPServerTest.cpp
        src/tests/ThreadPoolTest.cpp 
        src/tests/ConcurrencyTest.cpp
        src/tests/ParserTest.cpp
        src/tests/StorageManagerTest.cpp
        src/tests/test_recommend.cpp
        src/tests/HelpCommandTest.cpp
        src/tests/GetCommandTest.cpp
        src/tests/PatchCommandTest.cpp
        src/tests/DeleteCommandTest.cpp
        src/tests/PostCommandTest.cpp
        src/tests/LogicalValidationTest.cpp
        src/tests/ParserCommandRecognitionTest.cpp
        src/tests/ResponseFormatTest.cpp
)

# ==========================================
# 4. Executables (Build Targets)
# ==========================================

# Main application executable
add_executable(WoltProject
        src/main.cpp
        ${CORE_SOURCES}
)

# Unit test executable
add_executable(WoltProjectTests
        ${TEST_SOURCES}
        ${CORE_SOURCES}
)

# ==========================================
# 5. Linking & Test Registration
# ==========================================

# Link GoogleTest and Threads.
target_link_libraries(WoltProject PRIVATE Threads::Threads)
target_link_libraries(WoltProjectTests PRIVATE ${GTEST_BOTH_LIBRARIES} Threads::Threads)

# Register tests automatically with CTest (Modern CMake way for GTest)
include(GoogleTest)
gtest_discover_tests(WoltProjectTests)

# Concurrent load generator used to measure throughput before/after.
add_executable(WoltLoadTest
        src/tools/LoadTest.cpp
)
target_link_libraries(WoltLoadTest PRIVATE Threads::Threads)