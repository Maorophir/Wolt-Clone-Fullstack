#pragma once

#include "interfaces/IUserHistoryProvider.h"
#include "interfaces/IStorageManager.h"
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <string>

// Manages all application data:
// - User viewing history (which products each user has viewed)
// - Provides methods for data access and manipulation
// - Handles file persistence (save/load)
class StorageManager : public IStorageManager, public IUserHistoryProvider {
private:
    // userHistory: maps user ID to the set of product IDs they've viewed.
    // Optimization: Using unordered_map and unordered_set for O(1) average time lookups.
    std::unordered_map<int, std::unordered_set<int>> userHistory;
    std::string dataFile;

    // Helper method to parse a line from the file
    void parseLineAndAddData(const std::string& line);

public:
    explicit StorageManager(const std::string& filePath = "data/user_history.txt");
    ~StorageManager() = default;

    // Add multiple products to a user's viewing history
    void addProductsToUser(int userId, const std::vector<int>& productIds);

    // Get all products viewed by a user.
    // Optimization: Returning by const reference to avoid deep copies.
    const std::unordered_set<int>& getUserProducts(int userId) const;

    const std::unordered_map<int, std::unordered_set<int>>& getUserHistory() const override;

    // Check if a user has viewed a product
    bool hasUserViewedProduct(int userId, int productId) const;

    // Get all users in the system
    std::vector<int> getAllUsers() const;

    // Get the number of products a user has viewed
    int getUserProductCount(int userId) const;

    // Clear all data
    void clear();

    // Check if a user exists in the system
    bool userExists(int userId) const;

    // File persistence methods
    // Load data from file
    void loadFromFile();

    // Save data to file
    void saveToFile() const;

    // Delete multiple products from a user's viewing history
    void deleteProductsFromUser(int userId, const std::vector<int>& productIds);

};
