#include "StoredRecommendationEngine.h"
#include "RecommendationEngine.h"

StoredRecommendationEngine::StoredRecommendationEngine(
    const IUserHistoryProvider& userHistoryProvider)
    : userHistoryProvider(userHistoryProvider)
{
}

std::vector<int> StoredRecommendationEngine::recommend(int userId, int productId) const
{
    RecommendationEngine engine(userHistoryProvider.getUserHistory());
    return engine.recommend(userId, productId);
}