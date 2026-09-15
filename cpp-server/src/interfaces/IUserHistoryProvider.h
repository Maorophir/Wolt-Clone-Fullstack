#pragma once

#include <unordered_map>
#include <unordered_set>

// Supplies a read-only view of the user-history table.
//
// The view is returned BY VALUE, not by reference, on purpose: the underlying
// table is shared between server worker threads, so a reference would let the
// caller read a container that another thread is concurrently rehashing or
// erasing from. Implementations take the snapshot under their own lock, which
// makes the copy both consistent and safe to use after the lock is released.
class IUserHistoryProvider {
public:
    virtual ~IUserHistoryProvider() = default;

    virtual std::unordered_map<int, std::unordered_set<int>> getUserHistory() const = 0;
};