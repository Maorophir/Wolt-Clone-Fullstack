#include <gtest/gtest.h>
#include <filesystem>
#include <sstream>

#include "commands/GetCommand.h"
#include "data_management/StorageManager.h"
#include "recommendation/RecommendationEngine.h"

namespace {

class GetCommandTest : public ::testing::Test {
protected:
    const std::string testFilePath = "get_test_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

//(malformed): GET with no userid -> 400 Bad Request.
TEST_F(GetCommandTest, MissingUserIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    GetCommand get(&storage);

    EXPECT_EQ("400 Bad Request", get.execute({"get"}));
}

//(malformed): GET with no productid -> 400 Bad Request.
TEST_F(GetCommandTest, MissingProductIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    GetCommand get(&storage);

    EXPECT_EQ("400 Bad Request", get.execute({"get", "1"}));
}

//(malformed): GET with too many arguments -> 400 Bad Request.
TEST_F(GetCommandTest, TooManyArgumentsReturnsBadRequest) {
    StorageManager storage(testFilePath);
    GetCommand get(&storage);

    EXPECT_EQ("400 Bad Request", get.execute({"get", "1", "100", "200"}));
}

// Retained from earlier PR: covers the "insufficient args" path explicitly.
TEST_F(GetCommandTest, InsufficientArgsReturnsBadRequest) {
    StorageManager storage(testFilePath);
    GetCommand get(&storage);

    EXPECT_EQ("400 Bad Request", get.execute({"get", "1"}));
}

//non-integer ids -> 400 Bad Request.
TEST_F(GetCommandTest, NonIntegerArgsReturnsBadRequest) {
    StorageManager storage(testFilePath);
    GetCommand get(&storage);

    EXPECT_EQ("400 Bad Request", get.execute({"get", "one", "100"}));
}

//user that was never created (no POST) -> 404 Not Found.
TEST_F(GetCommandTest, UnknownUserReturnsNotFound) {
    StorageManager storage(testFilePath);
    GetCommand get(&storage);

    EXPECT_EQ("404 Not Found", get.execute({"get", "1", "100"}));
}

//existing user with no recommendations -> "200 Ok" + two newlines + empty body.
TEST_F(GetCommandTest, ExistingUserWithNoRecsReturnsOkEmptyBody) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100});

    GetCommand get(&storage);
    EXPECT_EQ("200 Ok\n\n", get.execute({"get", "1", "200"}));
}

//existing user with recommendations -> "200 Ok\n\n<space-separated ids>".
TEST_F(GetCommandTest, ReturnsOkAndSpaceSeparatedRecommendations) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {10, 20, 30});
    storage.addProductsToUser(2, {10, 20, 40, 50});
    storage.addProductsToUser(3, {10, 30, 40, 60});

    GetCommand get(&storage);

    // For user 1 viewing product 10: expected recs are 40, 50, 60
    // (matches the existing RecommendationEngine test fixture).
    EXPECT_EQ("200 Ok\n\n40 50 60", get.execute({"get", "1", "10"}));
}

//a valid GET response starts EXACTLY with "200 Ok" and is followed by
// exactly two newline characters before the recommendation body, with no other
// content between them.
TEST_F(GetCommandTest, ResponseStartsWith200OkFollowedByExactlyTwoNewlines) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {10, 20, 30});
    storage.addProductsToUser(2, {10, 20, 40, 50});
    storage.addProductsToUser(3, {10, 30, 40, 60});

    GetCommand get(&storage);
    const std::string response = get.execute({"get", "1", "10"});

    // Starts with the exact status line "200 Ok" -- no extra characters in front.
    ASSERT_GE(response.size(), std::string("200 Ok\n\n").size());
    EXPECT_EQ(0u, response.find("200 Ok"));

    // The two characters following "200 Ok" must both be '\n'.
    EXPECT_EQ('\n', response[6]);
    EXPECT_EQ('\n', response[7]);

    // And the character after the blank line must NOT itself be '\n' -- that
    // would mean there are three newlines after "200 Ok", not the required two.
    ASSERT_GT(response.size(), 8u);
    EXPECT_NE('\n', response[8]);

    // The recommendation output appears after the blank line.
    EXPECT_EQ("40 50 60", response.substr(8));
}

//GET must REUSE the Exercise 1 RecommendationEngine -- no second
// algorithm. Compute the recommendation directly via the Ex1 engine, then
// compute it via GetCommand, and assert byte-for-byte equality of the body.
// If anyone ever forked the algorithm, this test breaks.
TEST_F(GetCommandTest, GetCommandReusesEx1RecommendationEngine) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {10, 20, 30});
    storage.addProductsToUser(2, {10, 20, 40, 50});
    storage.addProductsToUser(3, {10, 30, 40, 60});

    // Ex1 path: build the engine directly from the raw user-history table.
    RecommendationEngine ex1Engine(storage.getUserHistory());
    const std::vector<int> ex1Recs = ex1Engine.recommend(1, 10);

    // Ex2 path: GET command through the new architecture.
    GetCommand get(&storage);
    const std::string response = get.execute({"get", "1", "10"});

    // Strip the "200 Ok\n\n" wrapper -- the wrapper is Ex2 protocol formatting,
    // not part of the recommendation algorithm.
    const std::string prefix = "200 Ok\n\n";
    ASSERT_EQ(0u, response.find(prefix));
    const std::string body = response.substr(prefix.size());

    // Reconstruct the expected body from the Ex1 result and compare.
    std::ostringstream oss;
    for (size_t i = 0; i < ex1Recs.size(); i++) {
        if (i > 0) oss << " ";
        oss << ex1Recs[i];
    }
    EXPECT_EQ(oss.str(), body);
}

//GET delegates to the recommendation flow -- the body must match
// the engine's output for that (user, product) pair.
TEST_F(GetCommandTest, RecommendationBodyMatchesRecommendationFlow) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {10, 20, 30});
    storage.addProductsToUser(2, {10, 20, 40, 50});
    storage.addProductsToUser(3, {10, 30, 40, 60});

    GetCommand get(&storage);
    const std::string response = get.execute({"get", "1", "10"});

    // Strip the "200 Ok\n\n" prefix; what remains is the recommendation flow
    // output that user code can parse.
    const std::string prefix = "200 Ok\n\n";
    ASSERT_EQ(0u, response.find(prefix));
    const std::string body = response.substr(prefix.size());

    EXPECT_EQ("40 50 60", body);
}
