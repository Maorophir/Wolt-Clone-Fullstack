//response-format contract.
//
// These tests pin every exact protocol response string the assignment
// mandates. They are deliberately format-focused, not business-focused:
// each test asserts byte-for-byte text equality. If anyone ever appends
// stray whitespace, an explanatory phrase, or a debug print to a response,
// these tests fail.
//
// The contract is split across two layers:
//   1. CommandParser::processCommand layer: returns the exact response
//      body WITHOUT a trailing '\n' (the TCP server adds it).
//   2. TCP wire layer: every response ends with exactly one '\n' that the
//      server appends.
//
// Layer 1 is verified in-process via CommandParser. Layer 2 is verified
// end-to-end via an actual TCP socket against the existing TCPServer.
// No network or server code is modified by these tests -- they only
// observe the existing wire flow.

#include <gtest/gtest.h>
#include <filesystem>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>

#include "CommandParser.h"
#include "../network/TCPServer.h"

namespace {

class ResponseFormatTest : public ::testing::Test {
protected:
    const std::string testFilePath = "response_format_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

// =====================================================================
// Layer 1: CommandParser-level response strings (no socket).
// =====================================================================

//POST success is EXACTLY "201 Created" (no trailing newline,
// no leading/trailing whitespace, no extra text).
TEST_F(ResponseFormatTest, PostSuccessIsExact201Created) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("201 Created", parser.processCommand("post 1 100"));
}

//PATCH success is EXACTLY "204 No Content".
TEST_F(ResponseFormatTest, PatchSuccessIsExact204NoContent) {
    CommandParser parser(testFilePath);
    ASSERT_EQ("201 Created", parser.processCommand("post 1 100"));
    EXPECT_EQ("204 No Content", parser.processCommand("patch 1 200"));
}

//DELETE success is EXACTLY "204 No Content".
TEST_F(ResponseFormatTest, DeleteSuccessIsExact204NoContent) {
    CommandParser parser(testFilePath);
    ASSERT_EQ("201 Created", parser.processCommand("post 1 100 200"));
    EXPECT_EQ("204 No Content", parser.processCommand("delete 1 100"));
}

//404 Not Found is exact, everywhere it can appear.
TEST_F(ResponseFormatTest, NotFoundIsExact404NotFound) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("404 Not Found", parser.processCommand("patch 1 100"));
    EXPECT_EQ("404 Not Found", parser.processCommand("delete 1 100"));
    EXPECT_EQ("404 Not Found", parser.processCommand("get 1 100"));

    ASSERT_EQ("201 Created", parser.processCommand("post 1 100"));
    EXPECT_EQ("404 Not Found", parser.processCommand("post 1 200"));      // dup user
    EXPECT_EQ("404 Not Found", parser.processCommand("delete 1 999"));    // unviewed product
}

//400 Bad Request is exact, everywhere it can appear.
TEST_F(ResponseFormatTest, BadRequestIsExact400BadRequest) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand("foobar"));
    EXPECT_EQ("400 Bad Request", parser.processCommand("add 1 100"));         // legacy verb
    EXPECT_EQ("400 Bad Request", parser.processCommand("recommend 1 100"));   // legacy verb
    EXPECT_EQ("400 Bad Request", parser.processCommand("post"));              // missing args
    EXPECT_EQ("400 Bad Request", parser.processCommand("get 1 100 200"));     // too many args
    EXPECT_EQ("400 Bad Request", parser.processCommand("delete 1 abc"));      // non-int
}

//GET success response starts with "200 Ok", followed by EXACTLY
// two newline characters, followed by the recommendation body. There must
// not be a third newline, leading whitespace, prefix prose, etc.
TEST_F(ResponseFormatTest, GetSuccessStartsWith200OkExactlyTwoNewlinesThenBody) {
    CommandParser parser(testFilePath);
    ASSERT_EQ("201 Created", parser.processCommand("post 1 10 20 30"));
    ASSERT_EQ("201 Created", parser.processCommand("post 2 10 20 40 50"));
    ASSERT_EQ("201 Created", parser.processCommand("post 3 10 30 40 60"));

    const std::string response = parser.processCommand("get 1 10");

    // Starts exactly with "200 Ok" (no leading whitespace, no other prefix).
    ASSERT_GE(response.size(), 8u);
    EXPECT_EQ(0u, response.find("200 Ok"));

    // Exactly two newline characters follow "200 Ok".
    EXPECT_EQ('\n', response[6]);
    EXPECT_EQ('\n', response[7]);
    // The byte after the blank line must not itself be '\n' -- that would
    // be three newlines, not two.
    ASSERT_GT(response.size(), 8u);
    EXPECT_NE('\n', response[8]);

    // Body comes right after the blank line, no other padding.
    EXPECT_EQ("40 50 60", response.substr(8));
}

//A GET response must never contain any explanatory text like
// "Result:" or "Recommendations:" -- only the protocol status and the body.
TEST_F(ResponseFormatTest, GetResponseHasNoExtraExplanatoryText) {
    CommandParser parser(testFilePath);
    ASSERT_EQ("201 Created", parser.processCommand("post 1 10 20"));
    ASSERT_EQ("201 Created", parser.processCommand("post 2 10 20 30"));

    const std::string response = parser.processCommand("get 1 10");

    // Bag of prose phrases that have leaked into spec-violating responses
    // before. None of these should appear anywhere.
    for (const char* needle : {"Recommendation", "Result", "Response",
                               "Error", "Note", "Info", "debug"}) {
        EXPECT_EQ(std::string::npos, response.find(needle))
            << "Unexpected prose token '" << needle << "' in: " << response;
    }
}

//empty input through the parser produces no body (the server-level
// trailing newline test below confirms the wire view).
TEST_F(ResponseFormatTest, EmptyInputProducesEmptyParserResponse) {
    CommandParser parser(testFilePath);
    EXPECT_EQ("400 Bad Request", parser.processCommand(""));
    EXPECT_EQ("400 Bad Request", parser.processCommand("   "));
}

// =====================================================================
// Layer 2: end-to-end wire format through the actual TCPServer.
//
// We spin up the server, send each command, then assert the response
// ends with exactly one '\n' that the server appended.
// =====================================================================

namespace {

class ResponseFormatThroughServerTest : public ::testing::Test {
protected:
    const int testPort = 9981;
    const std::string testFilePath = "response_format_wire_user_history.txt";

    CommandParser* parser = nullptr;
    TCPServer* server = nullptr;
    std::thread serverThread;

    void SetUp() override {
        std::filesystem::remove(testFilePath);

        parser = new CommandParser(testFilePath);
        server = new TCPServer(testPort, *parser);

        serverThread = std::thread([this]() {
            server->start();
        });

        // Give the server time to bind/listen.
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    void TearDown() override {
        if (server) {
            server->stop();
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            delete server;
        }
        if (serverThread.joinable()) {
            serverThread.join();
        }
        delete parser;
        std::filesystem::remove(testFilePath);
    }

    // Sends "<message>\n" to the server, reads one buffer of response bytes,
    // and returns them as a std::string. Mirrors the technique in
    // TCPServerTest.cpp.
    std::string send(const std::string& message) {
        int sock = ::socket(AF_INET, SOCK_STREAM, 0);
        sockaddr_in serv_addr{};
        serv_addr.sin_family = AF_INET;
        serv_addr.sin_port = htons(testPort);
        inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr);

        if (::connect(sock, reinterpret_cast<sockaddr*>(&serv_addr),
                      sizeof(serv_addr)) < 0) {
            ::close(sock);
            return "CONNECTION_FAILED";
        }

        const std::string framed = message + "\n";
        ::send(sock, framed.c_str(), framed.length(), 0);

        char buffer[4096] = {0};
        ::read(sock, buffer, sizeof(buffer) - 1);
        ::close(sock);

        return std::string(buffer);
    }
};

} // namespace

//every successful command response, when delivered through the
// TCP server, terminates with exactly one '\n' that the server appended.
TEST_F(ResponseFormatThroughServerTest, SuccessResponsesEndWithExactlyOneTrailingNewline) {
    EXPECT_EQ("201 Created\n",   send("post 1 100"));
    EXPECT_EQ("204 No Content\n", send("patch 1 200"));
    EXPECT_EQ("204 No Content\n", send("delete 1 100"));
}

//every error response (404 / 400) terminates with exactly one
// '\n' over the wire.
TEST_F(ResponseFormatThroughServerTest, ErrorResponsesEndWithExactlyOneTrailingNewline) {
    EXPECT_EQ("404 Not Found\n",   send("patch 1 100"));
    EXPECT_EQ("404 Not Found\n",   send("delete 1 100"));
    EXPECT_EQ("400 Bad Request\n", send("foobar"));
    EXPECT_EQ("400 Bad Request\n", send("add 1 100"));      // legacy verb
    EXPECT_EQ("400 Bad Request\n", send("recommend 1 100"));// legacy verb
    EXPECT_EQ("400 Bad Request\n", send("post"));           // missing args
}

//GET's success wire format -- "200 Ok\n\n<body>\n" -- with the
// blank line preserved between status and body, and a single trailing
// newline appended by the server.
TEST_F(ResponseFormatThroughServerTest, GetSuccessHasBlankLineAndSingleTrailingNewline) {
    ASSERT_EQ("201 Created\n", send("post 1 10 20 30"));
    ASSERT_EQ("201 Created\n", send("post 2 10 20 40 50"));
    ASSERT_EQ("201 Created\n", send("post 3 10 30 40 60"));

    const std::string wire = send("get 1 10");

    // Exact wire format.
    EXPECT_EQ("200 Ok\n\n40 50 60\n", wire);

    // Single trailing newline (not two, not zero).
    ASSERT_FALSE(wire.empty());
    EXPECT_EQ('\n', wire.back());
    ASSERT_GE(wire.size(), 2u);
    EXPECT_NE('\n', wire[wire.size() - 2]);
}
