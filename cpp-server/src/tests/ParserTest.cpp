#include <gtest/gtest.h>
#include <filesystem>
#include "CommandParser.h"

using namespace std;

namespace {

class ParserTest : public ::testing::Test {
protected:
    const std::string testFilePath = "parser_test_user_history.txt";

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

//unknown command -> 400 Bad Request.
TEST_F(ParserTest, IgnoreUnrecognizedCommand) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("UNKNOWN COMMAND"));
}

//+old `recommend` keyword is no longer a valid command..
TEST_F(ParserTest, OldRecommendKeywordIsBadRequest) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("recommend 1 100"));
}

// Valid POST -> 201 Created.
TEST_F(ParserTest, ParsePostCommand) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post 1 100"));
}

// POST with insufficient args -> 400 Bad Request.
TEST_F(ParserTest, InvalidPostCommand) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("post 1"));
}

// Command name is case-insensitive (CommandParser lowercases it).
TEST_F(ParserTest, CommandIsCaseInsensitive) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("POST 2 200"));
}

// Multiple spaces between arguments are collapsed by the tokenizer.
TEST_F(ParserTest, ParseCommandWithMultipleSpaces) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post    1      100   101"));
}

// POST accepts multiple product ids.
TEST_F(ParserTest, ParsePostCommandMultipleProducts) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post 1 101 102 103 104"));
}

// Empty / whitespace-only input -> empty response (silently ignored).
TEST_F(ParserTest, IgnoreEmptyOrWhitespaceCommand) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand(""));
    EXPECT_EQ("400 Bad Request", parser.processCommand("   "));
}

//help command returns the new help text.
TEST_F(ParserTest, HelpCommandReturnsHelpText) {
    CommandParser parser(testFilePath);
    EXPECT_EQ(kExpectedHelp, parser.processCommand("help"));
}

///57: GET with insufficient args -> 400.
TEST_F(ParserTest, GetInsufficientArgs) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("get 1"));
}

//GET against an unknown user -> 404.
TEST_F(ParserTest, GetUnknownUserReturnsNotFound) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("404 Not Found", parser.processCommand("get 1 100"));
}

//GET against an existing user with no recs -> "200 Ok\n\n".
TEST_F(ParserTest, GetExistingUserNoRecs) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post 1 100"));
    EXPECT_EQ("200 Ok\n\n", parser.processCommand("get 1 200"));
}

//PATCH on a never-created user -> 404 Not Found.
TEST_F(ParserTest, PatchUnknownUserReturnsNotFound) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("404 Not Found", parser.processCommand("patch 1 100"));
}

//PATCH on existing user appends + 204 No Content.
TEST_F(ParserTest, PatchExistingUserReturnsNoContent) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created",   parser.processCommand("post 1 100"));
    EXPECT_EQ("204 No Content", parser.processCommand("patch 1 200 300"));
}

///57: malformed PATCH -> 400 Bad Request.
TEST_F(ParserTest, PatchMissingProductIdsReturnsBadRequest) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("patch 1"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("patch 1 abc"));
}

//DELETE on a never-created user -> 404 Not Found.
TEST_F(ParserTest, DeleteUnknownUserReturnsNotFound) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("404 Not Found", parser.processCommand("delete 1 100"));
}

//DELETE for a product the user never viewed -> 404 Not Found.
TEST_F(ParserTest, DeleteMissingProductReturnsNotFound) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post 1 100 200"));
    EXPECT_EQ("404 Not Found", parser.processCommand("delete 1 300"));
}

//valid DELETE removes the products + returns 204.
TEST_F(ParserTest, DeleteValidRemovesAndReturnsNoContent) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post 1 100 200 300"));
    EXPECT_EQ("204 No Content", parser.processCommand("delete 1 100 300"));
    // Subsequent DELETE of an already-removed product -> 404.
    EXPECT_EQ("404 Not Found", parser.processCommand("delete 1 100"));
}

///57: malformed DELETE -> 400 Bad Request.
TEST_F(ParserTest, DeleteMissingProductIdsReturnsBadRequest) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("delete 1"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("delete 1 abc"));
}

// parseCommand splits on whitespace.
TEST_F(ParserTest, ParseCommandTokenization) {
    CommandParser parser(testFilePath);
    auto tokens = parser.parseCommand("post 1 100 200");
    ASSERT_EQ(tokens.size(), 4u);
    EXPECT_EQ(tokens[0], "post");
    EXPECT_EQ(tokens[1], "1");
    EXPECT_EQ(tokens[2], "100");
    EXPECT_EQ(tokens[3], "200");
}
