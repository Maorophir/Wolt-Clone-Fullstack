#include <gtest/gtest.h>

// GoogleTest entry point for this test executable.
int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
