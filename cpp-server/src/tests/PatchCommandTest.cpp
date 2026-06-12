#include <gtest/gtest.h>
#include <filesystem>

#include "commands/PatchCommand.h"
#include "data_management/StorageManager.h"

namespace {

class PatchCommandTest : public ::testing::Test {
protected:
    const std::string testFilePath = "patch_test_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

//PATCH on a never-created user returns 404 Not Found.
TEST_F(PatchCommandTest, UnknownUserReturnsNotFound) {
    StorageManager storage(testFilePath);
    PatchCommand patch(&storage);

    EXPECT_EQ("404 Not Found", patch.execute({"patch", "1", "100"}));
}

//PATCH on an existing user appends the products and returns 204.
TEST_F(PatchCommandTest, ExistingUserAppendsAndReturnsNoContent) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200});

    PatchCommand patch(&storage);

    EXPECT_EQ("204 No Content", patch.execute({"patch", "1", "300", "400"}));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 200));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 300));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 400));
}

//PATCH duplicate products is idempotent (set semantics).
TEST_F(PatchCommandTest, PatchIsIdempotentForDuplicates) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200});

    PatchCommand patch(&storage);

    EXPECT_EQ("204 No Content", patch.execute({"patch", "1", "100", "200", "300"}));
    EXPECT_EQ(3, storage.getUserProductCount(1));
}

//(malformed): PATCH with no userid -> 400 Bad Request.
TEST_F(PatchCommandTest, MissingUserIdReturnsBadRequest) {
    StorageManager storage(testFilePath);
    PatchCommand patch(&storage);

    EXPECT_EQ("400 Bad Request", patch.execute({"patch"}));
}

///57: PATCH with no product ids is malformed -> 400 Bad Request.
TEST_F(PatchCommandTest, MissingProductIdsReturnsBadRequest) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100});

    PatchCommand patch(&storage);

    EXPECT_EQ("400 Bad Request", patch.execute({"patch", "1"}));
}

//(malformed): a malformed PATCH must not mutate stored data.
TEST_F(PatchCommandTest, MalformedPatchDoesNotMutateStorage) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200});

    PatchCommand patch(&storage);

    ASSERT_EQ("400 Bad Request", patch.execute({"patch", "1", "abc"}));
    EXPECT_EQ(2, storage.getUserProductCount(1));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(storage.hasUserViewedProduct(1, 200));
}

///57: PATCH with non-integer args is malformed -> 400 Bad Request.
TEST_F(PatchCommandTest, NonIntegerArgsReturnsBadRequest) {
    StorageManager storage(testFilePath);

    PatchCommand patch(&storage);

    EXPECT_EQ("400 Bad Request", patch.execute({"patch", "one", "100"}));
    EXPECT_EQ("400 Bad Request", patch.execute({"patch", "1", "abc"}));
}
