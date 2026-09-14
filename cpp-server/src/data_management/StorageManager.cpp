#include "StorageManager.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <system_error>
#include <mutex>
#include <shared_mutex>

// Storage format (one user per line):
// userId productId1 productId2 ...
//
// Locking convention used throughout this file:
//   std::shared_lock  -> read-only access, many threads at once
//   std::unique_lock  -> mutation, exclusive
// A *Locked() helper assumes the caller already holds the lock, because
// std::shared_mutex is not recursive and re-locking it would self-deadlock.

StorageManager::StorageManager(const std::string& filePath)
    : dataFile(filePath) {
    loadFromFile();
}

// ---------------------------------------------------------------------------
// Compound atomic operations
// ---------------------------------------------------------------------------

bool StorageManager::createUserWithProducts(int userId, const std::vector<int>& productIds) {
    std::unique_lock<std::shared_mutex> lock(historyMutex);

    // The existence check and the insertion happen inside the SAME critical
    // section. Doing them as two locked calls would let two threads both see
    // "absent" and both report success for the same user.
    if (userHistory.count(userId) > 0) {
        return false;
    }

    userHistory[userId].insert(productIds.begin(), productIds.end());
    saveToFileLocked();
    return true;
}

bool StorageManager::appendProductsIfUserExists(int userId, const std::vector<int>& productIds) {
    std::unique_lock<std::shared_mutex> lock(historyMutex);

    auto it = userHistory.find(userId);
    if (it == userHistory.end()) {
        return false;
    }

    it->second.insert(productIds.begin(), productIds.end());
    saveToFileLocked();
    return true;
}

bool StorageManager::deleteProductsIfAllPresent(int userId, const std::vector<int>& productIds) {
    std::unique_lock<std::shared_mutex> lock(historyMutex);

    auto it = userHistory.find(userId);
    if (it == userHistory.end()) {
        return false;
    }

    // Validate everything before touching anything, still under the same lock,
    // so the operation is all-or-nothing. Validating in one locked call and
    // deleting in another would let a concurrent DELETE remove a product
    // between the two and leave the history partially modified after a 404.
    for (int productId : productIds) {
        if (it->second.count(productId) == 0) {
            return false;
        }
    }

    for (int productId : productIds) {
        it->second.erase(productId);
    }

    saveToFileLocked();
    return true;
}

// ---------------------------------------------------------------------------
// Simple mutations
// ---------------------------------------------------------------------------

void StorageManager::addProductsToUser(int userId, const std::vector<int>& productIds) {
    std::unique_lock<std::shared_mutex> lock(historyMutex);
    userHistory[userId].insert(productIds.begin(), productIds.end());
    saveToFileLocked();
}

void StorageManager::deleteProductsFromUser(int userId, const std::vector<int>& productIds) {
    std::unique_lock<std::shared_mutex> lock(historyMutex);
    auto it = userHistory.find(userId);
    if (it == userHistory.end()) {
        return;
    }
    for (int productId : productIds) {
        it->second.erase(productId);
    }
    saveToFileLocked();
}

void StorageManager::clear() {
    std::unique_lock<std::shared_mutex> lock(historyMutex);
    userHistory.clear();
    saveToFileLocked();
}

// ---------------------------------------------------------------------------
// Queries (shared lock: concurrent readers do not block each other)
// ---------------------------------------------------------------------------

StorageManager::UserHistory StorageManager::getUserHistory() const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    // Returned BY VALUE. Handing out a reference to the live table would let a
    // reader iterate it while a writer rehashes or erases from it.
    return userHistory;
}

std::unordered_set<int> StorageManager::getUserProducts(int userId) const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    auto it = userHistory.find(userId);
    if (it != userHistory.end()) {
        return it->second;
    }
    return {};
}

bool StorageManager::hasUserViewedProduct(int userId, int productId) const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    auto it = userHistory.find(userId);
    if (it != userHistory.end()) {
        return it->second.count(productId) == 1;
    }
    return false;
}

std::vector<int> StorageManager::getAllUsers() const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    std::vector<int> users;
    users.reserve(userHistory.size());
    for (const auto& pair : userHistory) {
        users.push_back(pair.first);
    }
    return users;
}

int StorageManager::getUserProductCount(int userId) const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    auto it = userHistory.find(userId);
    if (it != userHistory.end()) {
        return static_cast<int>(it->second.size());
    }
    return 0;
}

bool StorageManager::userExists(int userId) const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    return userHistory.count(userId) > 0;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

void StorageManager::loadFromFile() {
    std::unique_lock<std::shared_mutex> lock(historyMutex);

    std::ifstream file(dataFile);
    if (!file.is_open()) {
        // Missing data file is valid on first run; keep in-memory storage empty.
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        if (!line.empty()) {
            parseLineAndAddDataLocked(line);
        }
    }
    file.close();
}

void StorageManager::saveToFile() const {
    std::shared_lock<std::shared_mutex> lock(historyMutex);
    saveToFileLocked();
}

void StorageManager::saveToFileLocked() const {
    // Create the parent directories if they don't exist
    std::filesystem::path pathObj(dataFile);
    std::filesystem::path parentDir = pathObj.parent_path();
    std::error_code ec;
    if (!parentDir.empty() && !std::filesystem::exists(parentDir)) {
        std::filesystem::create_directories(parentDir, ec);
    }

    // Write to a temporary file and rename it over the real one. rename() is
    // atomic on POSIX, so a reader (or a crash) never observes a half-written
    // file, and two writers can never interleave their bytes in one file.
    // The lock already serialises writers; this protects against anything
    // outside the process, and against the process dying mid-write.
    const std::string tempFile = dataFile + ".tmp";

    {
        std::ofstream file(tempFile, std::ios::trunc);
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
        file.flush();
    }

    std::filesystem::rename(tempFile, dataFile, ec);
    if (ec) {
        // Rename can fail across filesystems; fall back to a direct write so
        // persistence still happens.
        std::ofstream fallback(dataFile, std::ios::trunc);
        if (fallback.is_open()) {
            for (const auto& userPair : userHistory) {
                fallback << userPair.first;
                for (int productId : userPair.second) {
                    fallback << " " << productId;
                }
                fallback << "\n";
            }
        }
        std::filesystem::remove(tempFile, ec);
    }
}

void StorageManager::parseLineAndAddDataLocked(const std::string& line) {
    std::istringstream iss(line);
    int userId;
    iss >> userId;
    if (!iss) {
        return;
    }

    // Ensure a user with no products still exists after a reload.
    userHistory[userId];

    int productId;
    while (iss >> productId) {
        // Unordered set automatically deduplicates repeated product ids.
        userHistory[userId].insert(productId);
    }
}