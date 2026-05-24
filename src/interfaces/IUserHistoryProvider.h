#pragma once

#include <unordered_map>
#include <unordered_set>

class IUserHistoryProvider {
public:
    virtual ~IUserHistoryProvider() = default;

    virtual const std::unordered_map<int, std::unordered_set<int>>& getUserHistory() const = 0;
};