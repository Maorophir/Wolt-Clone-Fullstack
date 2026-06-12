//parser-only / command-recognition tests.
//
// These tests focus narrowly on the COMMAND PARSER:
//   - Every Ex2 verb (post, patch, delete, get, help) is recognized.
//   - Old Ex1 verbs (add, recommend) are not.
//   - Unknown verbs, empty input, whitespace-only input are rejected.
//   - parseCommand correctly tokenizes argument shapes for each verb.
//
// They deliberately do NOT cover business logic in depth -- the per-command
// test files do that. Recognition is asserted by:
//   - "recognized + valid"  -> response is something OTHER than 400 Bad Request
//                              (the parser's catch-all for unrecognized cmds).
//   - "recognized + logically invalid" -> response is 404 Not Found, not 400.
//   - "not recognized" -> 400 Bad Request.

#include <gtest/gtest.h>
#include <filesystem>

#include "CommandParser.h"

namespace {

class ParserCommandRecognitionTest : public ::testing::Test {
protected:
    const std::string testFilePath = "parser_recognition_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

// ---------------------------------------------------------------------
// Every Ex2 command verb is recognized.
// ---------------------------------------------------------------------

TEST_F(ParserCommandRecognitionTest, RecognizesPostVerb) {
    CommandParser parser(testFilePath);
    // POST a brand-new user -> 201 (so we know the verb was routed).
    EXPECT_EQ("201 Created", parser.processCommand("post 1 100"));
}

TEST_F(ParserCommandRecognitionTest, RecognizesPatchVerb) {
    CommandParser parser(testFilePath);
    // PATCH on missing user -> 404. The fact that it's 404 (not 400)
    // proves the parser routed to PatchCommand.
    EXPECT_EQ("404 Not Found", parser.processCommand("patch 1 100"));
}

TEST_F(ParserCommandRecognitionTest, RecognizesDeleteVerb) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("404 Not Found", parser.processCommand("delete 1 100"));
}

TEST_F(ParserCommandRecognitionTest, RecognizesGetVerb) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("404 Not Found", parser.processCommand("get 1 100"));
}

TEST_F(ParserCommandRecognitionTest, RecognizesHelpVerb) {
    CommandParser parser(testFilePath);
    const std::string response = parser.processCommand("help");
    EXPECT_NE("400 Bad Request", response);
    EXPECT_FALSE(response.empty());
    // Sanity: the response must contain command keywords.
    EXPECT_NE(std::string::npos, response.find("POST"));
    EXPECT_NE(std::string::npos, response.find("GET"));
}

TEST_F(ParserCommandRecognitionTest, RecognitionIsCaseInsensitive) {
    CommandParser parser(testFilePath);
    // Upper-case PATCH on missing user -> 404 (recognized).
    EXPECT_EQ("404 Not Found", parser.processCommand("PATCH 1 100"));
    EXPECT_EQ("404 Not Found", parser.processCommand("Delete 2 200"));
    // Mixed-case GET.
    EXPECT_EQ("404 Not Found", parser.processCommand("Get 3 300"));
}

// ---------------------------------------------------------------------
// Old Ex1 verbs are explicitly rejected.
// ---------------------------------------------------------------------

TEST_F(ParserCommandRecognitionTest, RejectsLegacyAddVerb) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("add 1 100"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("ADD 1 100"));
}

TEST_F(ParserCommandRecognitionTest, RejectsLegacyRecommendVerb) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("recommend 1 100"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("RECOMMEND 1 100"));
}

// ---------------------------------------------------------------------
// Unknown verbs / malformed input rejected by the parser layer.
// ---------------------------------------------------------------------

TEST_F(ParserCommandRecognitionTest, RejectsCompletelyUnknownVerb) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("foobar 1 100"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("xyzzy"));
}

TEST_F(ParserCommandRecognitionTest, EmptyInputReturnsEmpty) {
    CommandParser parser(testFilePath);
    // Empty -> empty response (silently ignored, distinct from 400).
    EXPECT_EQ("400 Bad Request", parser.processCommand(""));
}

TEST_F(ParserCommandRecognitionTest, WhitespaceOnlyInputReturnsEmpty) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("   "));
    EXPECT_EQ("400 Bad Request", parser.processCommand("\t\t"));
    EXPECT_EQ("400 Bad Request", parser.processCommand(" \t   \t "));
}

// ---------------------------------------------------------------------
// Argument shape per verb is correctly tokenized.
// ---------------------------------------------------------------------

TEST_F(ParserCommandRecognitionTest, ParseCommandExtractsPostArgs) {
    CommandParser parser(testFilePath);
    const auto tokens = parser.parseCommand("post 1 100 200 300");
    ASSERT_EQ(5u, tokens.size());
    EXPECT_EQ("post", tokens[0]);
    EXPECT_EQ("1",    tokens[1]);
    EXPECT_EQ("100",  tokens[2]);
    EXPECT_EQ("200",  tokens[3]);
    EXPECT_EQ("300",  tokens[4]);
}

TEST_F(ParserCommandRecognitionTest, ParseCommandExtractsPatchArgs) {
    CommandParser parser(testFilePath);
    const auto tokens = parser.parseCommand("patch 7 11 22");
    ASSERT_EQ(4u, tokens.size());
    EXPECT_EQ("patch", tokens[0]);
    EXPECT_EQ("7",     tokens[1]);
    EXPECT_EQ("11",    tokens[2]);
    EXPECT_EQ("22",    tokens[3]);
}

TEST_F(ParserCommandRecognitionTest, ParseCommandExtractsDeleteArgs) {
    CommandParser parser(testFilePath);
    const auto tokens = parser.parseCommand("delete 9 50 60");
    ASSERT_EQ(4u, tokens.size());
    EXPECT_EQ("delete", tokens[0]);
    EXPECT_EQ("9",      tokens[1]);
    EXPECT_EQ("50",     tokens[2]);
    EXPECT_EQ("60",     tokens[3]);
}

TEST_F(ParserCommandRecognitionTest, ParseCommandExtractsGetArgs) {
    CommandParser parser(testFilePath);
    const auto tokens = parser.parseCommand("get 42 7");
    ASSERT_EQ(3u, tokens.size());
    EXPECT_EQ("get", tokens[0]);
    EXPECT_EQ("42",  tokens[1]);
    EXPECT_EQ("7",   tokens[2]);
}

TEST_F(ParserCommandRecognitionTest, ParseCommandExtractsHelpArgs) {
    CommandParser parser(testFilePath);
    const auto tokens = parser.parseCommand("help");
    ASSERT_EQ(1u, tokens.size());
    EXPECT_EQ("help", tokens[0]);
}

TEST_F(ParserCommandRecognitionTest, ParseCommandCollapsesMultipleSpaces) {
    CommandParser parser(testFilePath);
    const auto tokens = parser.parseCommand("post    1     100");
    ASSERT_EQ(3u, tokens.size());
    EXPECT_EQ("post", tokens[0]);
    EXPECT_EQ("1",    tokens[1]);
    EXPECT_EQ("100",  tokens[2]);
}

// ---------------------------------------------------------------------
// "Too few" and "too many" argument cases the parser layer must reject.
// Note: per-command argument-count rules live inside the command's own
// validator; for GET we still verify here because GET has a stricter
// fixed arity (exactly 3 tokens), which is part of its "command shape".
// ---------------------------------------------------------------------

TEST_F(ParserCommandRecognitionTest, GetTooFewArgsIsRejected) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("get"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("get 1"));
}

TEST_F(ParserCommandRecognitionTest, GetTooManyArgsIsRejected) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("get 1 100 200"));
}

TEST_F(ParserCommandRecognitionTest, HelpWithExtraArgsStillRecognized) {
    CommandParser parser(testFilePath);
    // Help is tolerant of extra args -- recognition is what matters here.
    const std::string response = parser.processCommand("help extra args");
    EXPECT_NE("400 Bad Request", response);
    EXPECT_FALSE(response.empty());
}

TEST_F(ParserCommandRecognitionTest, MutatingVerbsRejectMissingRequiredArgs) {
    CommandParser parser(testFilePath);
    // Bare verb (no args) is always malformed.
    EXPECT_EQ("400 Bad Request", parser.processCommand("post"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("patch"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("delete"));
    // userid only (no productids).
    EXPECT_EQ("400 Bad Request", parser.processCommand("post 1"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("patch 1"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("delete 1"));
}
