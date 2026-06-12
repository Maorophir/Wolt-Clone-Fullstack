//Logical validation rules.
//
// The protocol distinguishes two failure modes:
//   - 400 Bad Request  -> the command itself is malformed (syntax)
//   - 404 Not Found    -> the command is well-formed but logically impossible
//                         against the CURRENT stored data
//
// This test file exercises the 404 path explicitly for every mutating verb,
// and pins the boundary between "syntax" failures (400) and "data" failures
// (404) so the two stay clearly separated.

#include <gtest/gtest.h>
#include <filesystem>

#include "commands/PostCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"
#include "data_management/StorageManager.h"

namespace {

class LogicalValidationTest : public ::testing::Test {
protected:
    const std::string testFilePath = "logical_validation_user_history.txt";

    void SetUp() override {
        std::filesystem::remove(testFilePath);
    }

    void TearDown() override {
        std::filesystem::remove(testFilePath);
    }
};

} // namespace

// ---------------------------------------------------------------------
// POST: logical rule -- user must NOT exist beforehand.
// ---------------------------------------------------------------------

TEST_F(LogicalValidationTest, PostOnExistingUserReturns404NotFound) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    ASSERT_EQ("201 Created", post.execute({"post", "1", "100"}));

    // Same userid, syntactically valid -> 404 because the user already exists.
    EXPECT_EQ("404 Not Found", post.execute({"post", "1", "200"}));
}

TEST_F(LogicalValidationTest, PostMalformedStaysAt400NotPromotedTo404) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);

    // Malformed inputs must always be 400; never 404 even on a freshly empty
    // store. 404 is reserved for "valid command, impossible data state".
    EXPECT_EQ("400 Bad Request", post.execute({"post"}));
    EXPECT_EQ("400 Bad Request", post.execute({"post", "1"}));
    EXPECT_EQ("400 Bad Request", post.execute({"post", "abc", "100"}));
}

// ---------------------------------------------------------------------
// PATCH: logical rule -- user MUST exist beforehand.
// ---------------------------------------------------------------------

TEST_F(LogicalValidationTest, PatchOnMissingUserReturns404NotFound) {
    StorageManager storage(testFilePath);
    PatchCommand patch(&storage);

    // Storage is empty -- syntactically valid PATCH, no such user -> 404.
    EXPECT_EQ("404 Not Found", patch.execute({"patch", "1", "100"}));
}

TEST_F(LogicalValidationTest, PatchMalformedStaysAt400NotPromotedTo404) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100}); // user exists
    PatchCommand patch(&storage);

    // Even though the user exists, malformed PATCH is still 400.
    EXPECT_EQ("400 Bad Request", patch.execute({"patch"}));
    EXPECT_EQ("400 Bad Request", patch.execute({"patch", "1"}));
    EXPECT_EQ("400 Bad Request", patch.execute({"patch", "1", "abc"}));
}

// ---------------------------------------------------------------------
// DELETE: logical rules -- user must exist AND every requested product
// must already be in that user's history.
// ---------------------------------------------------------------------

TEST_F(LogicalValidationTest, DeleteOnMissingUserReturns404NotFound) {
    StorageManager storage(testFilePath);
    DeleteCommand del(&storage);

    EXPECT_EQ("404 Not Found", del.execute({"delete", "1", "100"}));
}

TEST_F(LogicalValidationTest, DeleteOfUnviewedProductReturns404NotFound) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100, 200});
    DeleteCommand del(&storage);

    // User 1 exists, but never viewed 999.
    EXPECT_EQ("404 Not Found", del.execute({"delete", "1", "999"}));
}

TEST_F(LogicalValidationTest, DeleteMalformedStaysAt400NotPromotedTo404) {
    StorageManager storage(testFilePath);
    storage.addProductsToUser(1, {100}); // user + product exist
    DeleteCommand del(&storage);

    EXPECT_EQ("400 Bad Request", del.execute({"delete"}));
    EXPECT_EQ("400 Bad Request", del.execute({"delete", "1"}));
    EXPECT_EQ("400 Bad Request", del.execute({"delete", "1", "abc"}));
}

// ---------------------------------------------------------------------
// Cross-verb invariant: validation goes through the storage layer's
// existence predicates (userExists / hasUserViewedProduct). Command
// handlers do not bypass them. This is exercised by checking that
// removing a user's product makes a subsequent DELETE for it 404.
// ---------------------------------------------------------------------

TEST_F(LogicalValidationTest, ValidationReflectsLiveStorageState) {
    StorageManager storage(testFilePath);
    PostCommand post(&storage);
    PatchCommand patch(&storage);
    DeleteCommand del(&storage);

    // PATCH before POST -> 404
    EXPECT_EQ("404 Not Found", patch.execute({"patch", "1", "100"}));

    // POST creates the user.
    EXPECT_EQ("201 Created", post.execute({"post", "1", "100", "200"}));

    // PATCH now succeeds.
    EXPECT_EQ("204 No Content", patch.execute({"patch", "1", "300"}));

    // DELETE 100 succeeds.
    EXPECT_EQ("204 No Content", del.execute({"delete", "1", "100"}));

    // Same DELETE again -> 404 (product no longer associated with user).
    EXPECT_EQ("404 Not Found", del.execute({"delete", "1", "100"}));
}
