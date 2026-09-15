#include "StoredRecommendationEngine.h"
#include "RecommendationEngine.h"

#include <utility>

StoredRecommendationEngine::StoredRecommendationEngine(
    const IUserHistoryProvider& userHistoryProvider)
    : userHistoryProvider(userHistoryProvider)
{
}

std::vector<int> StoredRecommendationEngine::recommend(int userId, int productId) const
{
    // One consistent snapshot per request, moved into the engine so the table
    // is copied exactly once even though it crosses two objects. The whole
    // computation then runs on thread-local data with no lock held, so a long
    // recommendation never blocks a concurrent POST/PATCH/DELETE.
    return RecommendationEngine(userHistoryProvider.getUserHistory())
        .recommend(userId, productId);
}