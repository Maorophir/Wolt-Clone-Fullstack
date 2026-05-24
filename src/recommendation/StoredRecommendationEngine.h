#pragma once

#include "../interfaces/IRecommendationEngine.h"
#include "../interfaces/IUserHistoryProvider.h"

#include <vector>

/*
 * Connects the recommendation command to the current user-history source.
 *
 * This class does not know whether the data comes from files, a database,
 * or an in-memory test object. It only asks the provider for the current
 * user-history table and runs the recommendation algorithm on it.
 */
class StoredRecommendationEngine : public IRecommendationEngine {
public:
    explicit StoredRecommendationEngine(const IUserHistoryProvider& userHistoryProvider);

    std::vector<int> recommend(int userId, int productId) const override;

private:
    const IUserHistoryProvider& userHistoryProvider;
};