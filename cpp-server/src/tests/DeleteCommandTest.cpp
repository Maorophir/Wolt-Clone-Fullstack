#include <gtest/gtest.h>
#include <filesystem>

#include "commands/DeleteCommand.h"
#include "data_management/StorageManager.h"

namespace {

class DeleteCommandTest : public ::testing::Test {
protected:
    const std::string testFilePath = "delete_test_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

//DELETE on a never-created user returns 404 Not Found.
TEST_F(DeleteCommandTest, UnknownUserReturnsNotFound) {
    StorageManager storage(testFilePath);
    DeleteCommand del(&storage);

    EXPECT_EQ("404 Not Found", del.execute({"delete", "1", "100"}));
}

//DELETE for a product not in the user's history returns 404.
TEST_F(DeleteCommandTest, ProductNotViewedReturnsNotFound) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200});

    DeleteCommand del(&storage);

    EXPECT_EQ("404 Not Found", del.execute({"delete", "1", "300"}));
    // Storage must remain untouched.
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 200));
}

//if any requested product is missing, no products are deleted.
TEST_F(DeleteCommandTest, PartiallyMissingProductsLeavesStorageUnchanged) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200, 300});

    DeleteCommand del(&storage);

    EXPECT_EQ("404 Not Found",
              del.execute({"delete", "1", "100", "999"}));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 200));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 300));
}

//valid DELETE removes the requested products and returns 204.
TEST_F(DeleteCommandTest, ValidDeleteRemovesAndReturnsNoContent) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200, 300});

    DeleteCommand del(&storage);

    EXPECT_EQ("204 No Content",
              del.execute({"delete", "1", "100", "300"}));
    EXPECT_FALSE(storage.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 200));
    EXPECT_FALSE(storage.hasUserViewedProduct(1, 300));
}

//(malformed): DELETE with no userid -> 400 Bad Request.
TEST_F(DeleteCommandTest, MissingUserIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    DeleteCommand del(&storage);

    EXPECT_EQ("400 Bad Request", del.execute({"delete"}));
}

///57: DELETE with missing product ids is malformed -> 400 Bad Request.
TEST_F(DeleteCommandTest, MissingProductIdsReturnsBadRequest) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100});

    DeleteCommand del(&storage);

    EXPECT_EQ("400 Bad Request", del.execute({"delete", "1"}));
}

///57: DELETE with non-integer args is malformed -> 400 Bad Request.
TEST_F(DeleteCommandTest, NonIntegerArgsReturnsBadRequest) {
    StorageManager storage(testFilePath);

    DeleteCommand del(&storage);

    EXPECT_EQ("400 Bad Request", del.execute({"delete", "one", "100"}));
    EXPECT_EQ("400 Bad Request", del.execute({"delete", "1", "abc"}));
}
