#include <gtest/gtest.h>
#include <filesystem>

#include "commands/PostCommand.h"
#include "data_management/StorageManager.h"

namespace {

class PostCommandTest : public ::testing::Test {
protected:
    const std::string testFilePath = "post_test_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

// PRS-69: a valid POST for a new user returns exactly "201 Created".
TEST_F(PostCommandTest, ValidPostForNewUserReturns201Created) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    EXPECT_EQ("201 Created", post.execute({"post", "1", "100", "200"}));
}

// PRS-69: a valid POST stores every supplied product id under the new user.
TEST_F(PostCommandTest, ValidPostStoresProductIdsForUser) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    ASSERT_EQ("201 Created", post.execute({"post", "42", "10", "20", "30"}));

    EXPECT_TRUE(storage.userExists(42));
    EXPECT_TRUE(storage.hasUserViewedProduct(42, 10));
    EXPECT_TRUE(storage.hasUserViewedProduct(42, 20));
    EXPECT_TRUE(storage.hasUserViewedProduct(42, 30));
    EXPECT_EQ(3, storage.getUserProductCount(42));
}

// PRS-69: a valid POST with a single product id still succeeds.
TEST_F(PostCommandTest, ValidPostWithSingleProductIdSucceeds) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    EXPECT_EQ("201 Created", post.execute({"post", "7", "100"}));
    EXPECT_TRUE(storage.hasUserViewedProduct(7, 100));
}

// PRS-69: POST for an already existing user returns exactly "404 Not Found".
TEST_F(PostCommandTest, PostForExistingUserReturns404NotFound) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    ASSERT_EQ("201 Created", post.execute({"post", "1", "100"}));
    EXPECT_EQ("404 Not Found", post.execute({"post", "1", "200", "300"}));
}

// PRS-69: POST for an already existing user must NOT mutate stored data.
TEST_F(PostCommandTest, PostForExistingUserDoesNotUpdateStorage) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    ASSERT_EQ("201 Created", post.execute({"post", "1", "100", "200"}));
    ASSERT_EQ(2, storage.getUserProductCount(1));

    // Second POST: should be rejected with 404 and leave history alone.
    ASSERT_EQ("404 Not Found", post.execute({"post", "1", "300", "400"}));

    EXPECT_EQ(2, storage.getUserProductCount(1));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 200));
    EXPECT_FALSE(storage.hasUserViewedProduct(1, 300));
    EXPECT_FALSE(storage.hasUserViewedProduct(1, 400));
}

// PRS-69 (malformed): POST with no userid -> 400 Bad Request.
TEST_F(PostCommandTest, MissingUserIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    EXPECT_EQ("400 Bad Request", post.execute({"post"}));
}

// PRS-69 (malformed): POST with userid but no product ids -> 400 Bad Request.
TEST_F(PostCommandTest, MissingProductIdsReturnsBadRequest) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    EXPECT_EQ("400 Bad Request", post.execute({"post", "1"}));
}

// PRS-69 (malformed): non-integer userid -> 400 Bad Request.
TEST_F(PostCommandTest, NonIntegerUserIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    EXPECT_EQ("400 Bad Request", post.execute({"post", "one", "100"}));
}

// PRS-69 (malformed): non-integer product id -> 400 Bad Request.
TEST_F(PostCommandTest, NonIntegerProductIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    EXPECT_EQ("400 Bad Request", post.execute({"post", "1", "abc"}));
    EXPECT_EQ("400 Bad Request", post.execute({"post", "1", "100", "xyz"}));
}

// PRS-69 (malformed): a malformed POST must not create the user.
TEST_F(PostCommandTest, MalformedPostDoesNotCreateUser) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    ASSERT_EQ("400 Bad Request", post.execute({"post", "9", "abc"}));
    EXPECT_FALSE(storage.userExists(9));
}
