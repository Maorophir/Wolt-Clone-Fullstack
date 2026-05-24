cmake_minimum_required(VERSION 3.14)
project(WoltProject)

# ==========================================
# 1. Configuration & Settings
# ==========================================
# Use C++17 for all targets in this project.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

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

# Link GoogleTest and pthread to the test executable.
target_link_libraries(WoltProjectTests ${GTEST_BOTH_LIBRARIES} pthread)

# Register tests automatically with CTest (Modern CMake way for GTest)
include(GoogleTest)
gtest_discover_tests(WoltProjectTests)
