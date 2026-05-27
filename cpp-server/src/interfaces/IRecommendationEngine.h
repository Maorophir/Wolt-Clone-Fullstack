#pragma once

#include <vector>

class IRecommendationEngine
{
public:
    virtual ~IRecommendationEngine() = default;

    virtual std::vector<int> recommend(int userId, int productId) const = 0;
};