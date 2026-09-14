#pragma once

#include "interfaces/IUserHistoryProvider.h"
#include "interfaces/IStorageManager.h"
#include <unordered_map>
#include <unordered_set>
#include <shared_mutex>
#include <vector>
#include <string>

// Manages all application data:
// - User viewing history (which products each user has viewed)
// - Provides methods for data access and manipulation
// - Handles file persistence (save/load)
//
// THREAD SAFETY
// -------------
// A single StorageManager instance is shared by every worker thread in the
// server's pool, so every public method is safe to call concurrently.
//
// `historyMutex` is a reader/writer lock (std::shared_mutex):
//   - queries take a shared lock, so any number of GET/HELP requests proceed
//     in parallel;
//   - mutations take an exclusive lock, so a writer never overlaps a reader.
// This matters because the workload is read-heavy: recommendations walk the
// whole table while POST/PATCH/DELETE touch one user.
//
// Just locking each primitive is NOT enough. "Does the user exist?" followed by
// "create the user" is a check-then-act sequence: with per-call locking two
// threads can both observe "absent" and both create, so both answer 201 Created
// for the same user. The compound operations below (createUserWithProducts,
// appendProductsIfUserExists, deleteProductsIfAllPresent) do the check and the
// mutation inside ONE exclusive critical section, which is what actually makes
// the protocol responses correct under concurrency.
class StorageManager : public IStorageManager, public IUserHistoryProvider {
public:
    using UserHistory = std::unordered_map<int, std::unordered_set<int>>;

private:
    // userHistory: maps user ID to the set of product IDs they've viewed.
    // Optimization: Using unordered_map and unordered_set for O(1) average time lookups.
    // Guarded by historyMutex.
    UserHistory userHistory;
    std::string dataFile;

    // mutable so const observers (getUserHistory, userExists, ...) can still
    // take the shared lock.
    mutable std::shared_mutex historyMutex;

    // Helper method to parse a line from the file.
    // Caller must already hold the exclusive lock.
    void parseLineAndAddDataLocked(const std::string& line);

    // Persistence helper. Caller must already hold the lock (shared is enough
    // for a read-only snapshot write-out). Kept separate from the public
    // saveToFile() so mutators can persist without re-locking: std::shared_mutex
    // is NOT recursive, and re-locking it on the same thread would deadlock.
    void saveToFileLocked() const;

public:
    explicit StorageManager(const std::string& filePath = "data/user_history.txt");
    ~StorageManager() = default;

    // ---- Compound, atomic operations (check + mutate under one lock) --------

    // Creates a user that does not exist yet and seeds their history.
    // Returns false if the user already existed. Exactly one of N concurrent
    // callers for the same userId can observe true.
    bool createUserWithProducts(int userId, const std::vector<int>& productIds);

    // Appends products to a user that must already exist.
    // Returns false if the user does not exist.
    bool appendProductsIfUserExists(int userId, const std::vector<int>& productIds);

    // Removes products only if the user exists AND every requested product is
    // currently in their history; otherwise nothing is modified.
    // Returns false in that case, so the deletion is all-or-nothing.
    bool deleteProductsIfAllPresent(int userId, const std::vector<int>& productIds);

    // ---- Simple operations -------------------------------------------------

    // Add multiple products to a user's viewing history (creates the user if
    // absent). Kept for the IStorageManager interface and existing callers.
    void addProductsToUser(int userId, const std::vector<int>& productIds) override;

    // Delete multiple products from a user's viewing history.
    void deleteProductsFromUser(int userId, const std::vector<int>& productIds);

    // Get all products viewed by a user.
    // Returns a SNAPSHOT by value. The previous version returned a reference
    // into the map, which another thread could rehash or erase while the caller
    // was still reading it - a use-after-free waiting to happen.
    std::unordered_set<int> getUserProducts(int userId) const;

    // Consistent snapshot of the whole table, taken under the shared lock.
    UserHistory getUserHistory() const override;

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
    // Load data from file (replaces current contents)
    void loadFromFile();

    // Save data to file
    void saveToFile() const;
};