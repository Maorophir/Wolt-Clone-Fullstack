#include <gtest/gtest.h>
#include <filesystem>

#include "commands/HelpCommand.h"
#include "data_management/StorageManager.h"

namespace {

class HelpCommandTest : public ::testing::Test {
protected:
    const std::string testFilePath = "help_test_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

const std::string kExpectedHelp =
    "DELETE, arguments: [userid] [productid1] [productid2] ...\n"
    "GET, arguments: [userid] [productid]\n"
    "PATCH, arguments: [userid] [productid1] [productid2] ...\n"
    "POST, arguments: [userid] [productid1] [productid2] ...\n"
    "help";

} // namespace

//HelpCommand returns the exact required help text.
TEST_F(HelpCommandTest, ReturnsExactHelpMessage) {
    StorageManager storage(testFilePath);
    HelpCommand helpCommand(&storage);

    EXPECT_EQ(kExpectedHelp, helpCommand.execute({"help"}));
}

// HelpCommand ignores extra args.
TEST_F(HelpCommandTest, IgnoresExtraArgs) {
    StorageManager storage(testFilePath);
    HelpCommand helpCommand(&storage);

    EXPECT_EQ(kExpectedHelp, helpCommand.execute({"help", "extra", "args"}));
}
