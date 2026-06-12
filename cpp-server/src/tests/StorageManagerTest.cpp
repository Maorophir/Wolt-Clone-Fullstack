#include <gtest/gtest.h>
#include "data_management/StorageManager.h"
#include <fstream>
#include <filesystem>
#include <algorithm>

class StorageManagerTest : public ::testing::Test {
protected:
    StorageManager* manager;
    const std::string testFilePath = "test_user_history.txt";

    void SetUp() override {
        // Clean up test file before each test
        std::filesystem::remove(testFilePath);
        manager = new StorageManager(testFilePath);
    }

    void TearDown() override {
        delete manager;
        // Clean up test file after each test
        std::filesystem::remove(testFilePath);
    }
};

// Test: Add products to a single user
TEST_F(StorageManagerTest, AddProductsToUser) {
    std::vector<int> products = {100, 200, 300};
    manager->addProductsToUser(1, products);
   
    std::unordered_set<int> userProducts = manager->getUserProducts(1);
    EXPECT_EQ(userProducts.size(), 3);
    EXPECT_TRUE(userProducts.count(100) > 0);
    EXPECT_TRUE(userProducts.count(200) > 0);
    EXPECT_TRUE(userProducts.count(300) > 0);
}

// Test: Add products to multiple users
TEST_F(StorageManagerTest, AddProductsToMultipleUsers) {
    manager->addProductsToUser(1, {100, 200});
    manager->addProductsToUser(2, {150, 250});
    manager->addProductsToUser(3, {100});
   
    EXPECT_EQ(manager->getUserProducts(1).size(), 2);
    EXPECT_EQ(manager->getUserProducts(2).size(), 2);
    EXPECT_EQ(manager->getUserProducts(3).size(), 1);
}

// Test: Get user products
TEST_F(StorageManagerTest, GetUserProducts) {
    manager->addProductsToUser(1, {100, 200, 300});
   
    std::unordered_set<int> products = manager->getUserProducts(1);
    EXPECT_EQ(products.size(), 3);
    EXPECT_TRUE(products.count(100) > 0);
}

// Test: Get products for non-existent user returns empty set
TEST_F(StorageManagerTest, GetProductsNonExistentUser) {
    std::unordered_set<int> products = manager->getUserProducts(999);
    EXPECT_EQ(products.size(), 0);
}

// Test: Check if user has viewed a product
TEST_F(StorageManagerTest, HasUserViewedProduct) {
    manager->addProductsToUser(1, {100, 200});
   
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 100));
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 200));
    EXPECT_FALSE(manager->hasUserViewedProduct(1, 300));
}

// Test: Get all users
TEST_F(StorageManagerTest, GetAllUsers) {
    manager->addProductsToUser(1, {100});
    manager->addProductsToUser(2, {200});
    manager->addProductsToUser(3, {300});
   
    std::vector<int> users = manager->getAllUsers();
    EXPECT_EQ(users.size(), 3);
    EXPECT_TRUE(std::find(users.begin(), users.end(), 1) != users.end());
    EXPECT_TRUE(std::find(users.begin(), users.end(), 2) != users.end());
    EXPECT_TRUE(std::find(users.begin(), users.end(), 3) != users.end());
}

// Test: Get user product count
TEST_F(StorageManagerTest, GetUserProductCount) {
    manager->addProductsToUser(1, {100, 200, 300});
   
    EXPECT_EQ(manager->getUserProductCount(1), 3);
}

// Test: Get product count for non-existent user
TEST_F(StorageManagerTest, GetProductCountNonExistentUser) {
    EXPECT_EQ(manager->getUserProductCount(999), 0);
}

// Test: User existence check
TEST_F(StorageManagerTest, UserExists) {
    manager->addProductsToUser(1, {100});
   
    EXPECT_TRUE(manager->userExists(1));
    EXPECT_FALSE(manager->userExists(2));
}

// Test: Clear all data
TEST_F(StorageManagerTest, ClearData) {
    manager->addProductsToUser(1, {100});
    manager->addProductsToUser(2, {200});
   
    manager->clear();
   
    EXPECT_EQ(manager->getAllUsers().size(), 0);
    EXPECT_FALSE(manager->userExists(1));
    EXPECT_FALSE(manager->userExists(2));
}

// Test: Save and load data from file
TEST_F(StorageManagerTest, SaveAndLoadData) {
    manager->addProductsToUser(1, {100, 200});
    manager->addProductsToUser(2, {300, 400, 500});
   
    // Delete the current manager and create a new one that loads from the same file
    if (manager) {
        delete manager;
        manager = nullptr;
    }
    StorageManager manager2(testFilePath);
   
    EXPECT_TRUE(manager2.userExists(1));
    EXPECT_TRUE(manager2.userExists(2));
    EXPECT_EQ(manager2.getUserProducts(1).size(), 2);
    EXPECT_EQ(manager2.getUserProducts(2).size(), 3);
    EXPECT_TRUE(manager2.hasUserViewedProduct(1, 100));
    EXPECT_TRUE(manager2.hasUserViewedProduct(2, 500));
}

TEST_F(StorageManagerTest, AddDuplicateProducts) {
    manager->addProductsToUser(1, {100, 200, 100});
   
    // Set should eliminate duplicates
    EXPECT_EQ(manager->getUserProductCount(1), 2);
}

// Test: Get all users from empty manager
TEST_F(StorageManagerTest, GetAllUsersEmpty) {
    std::vector<int> users = manager->getAllUsers();
    EXPECT_EQ(users.size(), 0);
}

// --------------------------------------------------------------------------
//Storage operations that the Ex2 POST/PATCH/DELETE handlers depend on.
// These tests lock the public API surface that command handlers MUST go
// through -- they do not poke raw internals.
// --------------------------------------------------------------------------

//(POST): create a user the handler can detect didn't exist before.
TEST_F(StorageManagerTest, PostFlowCreatesUserDetectableViaUserExists) {
    EXPECT_FALSE(manager->userExists(1));

    manager->addProductsToUser(1, {100, 200});

    EXPECT_TRUE(manager->userExists(1));
    EXPECT_EQ(2, manager->getUserProductCount(1));
}

//(PATCH): update an EXISTING user's history without losing prior data.
TEST_F(StorageManagerTest, PatchFlowAppendsToExistingUserHistory) {
    manager->addProductsToUser(1, {100, 200});
    ASSERT_TRUE(manager->userExists(1));

    // PATCH semantics: append, do not replace.
    manager->addProductsToUser(1, {300, 400});

    EXPECT_TRUE(manager->hasUserViewedProduct(1, 100));
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 200));
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 300));
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 400));
    EXPECT_EQ(4, manager->getUserProductCount(1));
}

//(DELETE): remove specific products and let the handler verify
// presence via hasUserViewedProduct beforehand.
TEST_F(StorageManagerTest, DeleteFlowRemovesOnlyRequestedProducts) {
    manager->addProductsToUser(1, {100, 200, 300, 400});

    // The handler checks each product is in history first.
    ASSERT_TRUE(manager->hasUserViewedProduct(1, 100));
    ASSERT_TRUE(manager->hasUserViewedProduct(1, 300));

    manager->deleteProductsFromUser(1, {100, 300});

    EXPECT_FALSE(manager->hasUserViewedProduct(1, 100));
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 200));
    EXPECT_FALSE(manager->hasUserViewedProduct(1, 300));
    EXPECT_TRUE(manager->hasUserViewedProduct(1, 400));
}

//(DELETE): handler-facing predicates correctly report missing data
// BEFORE any mutation. This is what lets DeleteCommand return 404 atomically.
TEST_F(StorageManagerTest, HasUserViewedProductReportsMissingMembership) {
    manager->addProductsToUser(1, {100});

    EXPECT_TRUE(manager->hasUserViewedProduct(1, 100));
    EXPECT_FALSE(manager->hasUserViewedProduct(1, 999));
    EXPECT_FALSE(manager->hasUserViewedProduct(42, 100));   // user doesn't exist
}

//(preserves Ex1 invariant): the recommendation engine reads through
// getUserHistory(); POST/PATCH/DELETE must keep that view consistent so the
// engine still produces correct results after Ex2-style mutations.
TEST_F(StorageManagerTest, UserHistoryViewStaysConsistentAfterMutations) {
    manager->addProductsToUser(1, {10, 20, 30});      // POST
    manager->addProductsToUser(1, {40});              // PATCH
    manager->deleteProductsFromUser(1, {20});         // DELETE

    const auto& history = manager->getUserHistory();
    ASSERT_TRUE(history.count(1));
    const auto& products = history.at(1);
    EXPECT_TRUE(products.count(10));
    EXPECT_FALSE(products.count(20));
    EXPECT_TRUE(products.count(30));
    EXPECT_TRUE(products.count(40));
    EXPECT_EQ(3u, products.size());
}
