#include "StorageManager.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <filesystem>

// Storage format (one user per line):
// userId productId1 productId2 ...

StorageManager::StorageManager(const std::string& filePath)
    : dataFile(filePath) {
    loadFromFile();
}

const std::unordered_map<int, std::unordered_set<int>>& StorageManager::getUserHistory() const {
    return userHistory;
}

void StorageManager::addProductsToUser(int userId, const std::vector<int>& productIds) {
    userHistory[userId].insert(productIds.begin(), productIds.end());
    saveToFile();
}

const std::unordered_set<int>& StorageManager::getUserProducts(int userId) const {
    // Safe static empty set avoids returning dangling references for missing users.
    static const std::unordered_set<int> emptySet;
    auto it = userHistory.find(userId);
    if (it != userHistory.end()) {
        return it->second;
    }
    return emptySet;
}

bool StorageManager::hasUserViewedProduct(int userId, int productId) const {
    auto it = userHistory.find(userId);
    if (it != userHistory.end()) {
        return it->second.count(productId) == 1;
    }
    return false;
}

std::vector<int> StorageManager::getAllUsers() const {
    std::vector<int> users;
    for (const auto& pair : userHistory) {
        users.push_back(pair.first);
    }
    return users;
}

int StorageManager::getUserProductCount(int userId) const {
    auto it = userHistory.find(userId);
    if (it != userHistory.end()) {
        return it->second.size();
    }
    return 0;
}

void StorageManager::clear() {
    userHistory.clear();
    saveToFile();
}

bool StorageManager::userExists(int userId) const {
    return userHistory.count(userId) > 0;
}

void StorageManager::loadFromFile() {
    std::ifstream file(dataFile);
    if (!file.is_open()) {
        // Missing data file is valid on first run; keep in-memory storage empty.
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        if (!line.empty()) {
            parseLineAndAddData(line);
        }
    }
    file.close();
}

void StorageManager::saveToFile() const {
    // Create the parent directories if they don't exist
    std::filesystem::path pathObj(dataFile);
    std::filesystem::path parentDir = pathObj.parent_path();
    if (!parentDir.empty() && !std::filesystem::exists(parentDir)) {
        std::filesystem::create_directories(parentDir);
    }

    std::ofstream file(dataFile);
    if (!file.is_open()) {
        // Best-effort persistence: silently skip on I/O open failure.
        return;
    }

    for (const auto& userPair : userHistory) {
        int userId = userPair.first;
        const auto& products = userPair.second;
       
        file << userId;
        for (int productId : products) {
            file << " " << productId;
        }
        file << "\n";
    }
    file.close();
}

void StorageManager::parseLineAndAddData(const std::string& line) {
    std::istringstream iss(line);
    int userId;
    iss >> userId;

    int productId;
    while (iss >> productId) {
        // Unordered set automatically deduplicates repeated product ids.
        userHistory[userId].insert(productId);
    }
}

void StorageManager::deleteProductsFromUser(int userId, const std::vector<int>& productIds) {
    for (int productId : productIds) {
        userHistory[userId].erase(productId);
    }
    saveToFile();
}   
