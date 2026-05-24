#pragma once
#include <vector>

class IStorageManager {
public:
    virtual ~IStorageManager() = default;
    
    virtual void addProductsToUser(int userId, const std::vector<int>& productIds) = 0;
};