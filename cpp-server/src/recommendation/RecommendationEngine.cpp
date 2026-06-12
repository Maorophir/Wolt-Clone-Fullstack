#include "RecommendationEngine.h"
#include <map>
#include <algorithm>

RecommendationEngine::RecommendationEngine(
    const std::unordered_map<int, std::unordered_set<int>>& watchedProductsByUser)
    : watchedProductsByUser(watchedProductsByUser)
{
}
   
std::vector<int> RecommendationEngine::recommend(int userId, int productId) const
{
    /*
     * productScores stores the third table from the assignment logic:
     *      product id -> total relevance score
     *
     * The score is built by adding the similarity value of every relevant user
     * who watched that product.
     */
    std::map<int, int> productScores;

    auto targetUserIt = watchedProductsByUser.find(userId);

    /*
     * If the user does not exist in the system, there is no history to compare
     * against, so no recommendations can be created.
     */
    if (targetUserIt == watchedProductsByUser.end())
    {
        return {};
    }

    const std::unordered_set<int>& targetUserProducts = targetUserIt->second;

    for (const auto& userEntry : watchedProductsByUser)
    {
        int otherUserId = userEntry.first;
        const std::unordered_set<int>& otherUserProducts = userEntry.second;

        /*
         * The target user should not recommend products to himself.
         */
        if (otherUserId == userId)
        {
            continue;
        }

        /*
         * Only users who watched the requested product are relevant.
         */
        if (otherUserProducts.find(productId) == otherUserProducts.end())
        {
            continue;
        }

        /*
         * The similarity value is calculated by counting the number of products that the target user and the other user both watched.
         * This is the weight that this user's products will add.
         */
        int similarity = countCommonProducts(targetUserProducts, otherUserProducts);

         /*
          * If there are no common products, the similarity is zero and this user
          * does not contribute to the recommendation.
          */

        if (similarity == 0)
        {
            continue;
        }

        for (int candidateProductId : otherUserProducts)
        {
            /*
             * Do not recommend the product that was used as the input.
             */
            if (candidateProductId == productId)
            {
                continue;
            }

            /*
             * Do not recommend products the target user already watched.
             */
            if (targetUserProducts.find(candidateProductId) != targetUserProducts.end())
            {
                continue;
            }

            productScores[candidateProductId] += similarity;
        }
    }

    std::vector<std::pair<int, int>> rankedProducts(productScores.begin(), productScores.end());

    /*
     * Sort by relevance score first.
     * If the score is equal, sort by product id in ascending order.
     */
    std::sort(
            rankedProducts.begin(),
            rankedProducts.end(),
            [](const auto& first, const auto& second)
            {
                if (first.second != second.second) {
                    return first.second > second.second;
                }
                return first.first < second.first;
            }
        );

    std::vector<int> recommendations;

    for (const auto& rankedProduct : rankedProducts)
    {
        if (recommendations.size() == 10)
        {
            break;
        }

        recommendations.push_back(rankedProduct.first);
    }

    return recommendations;
}

int RecommendationEngine::countCommonProducts(
    const std::unordered_set<int>& firstProducts,
    const std::unordered_set<int>& secondProducts) const
{
    int count = 0;
    const auto* smallerSet = &firstProducts;
    const auto* largerSet = &secondProducts;
   
    if (firstProducts.size() > secondProducts.size()) {
        smallerSet = &secondProducts;
        largerSet = &firstProducts;
    }

    for (int productId : *smallerSet) {
        if (largerSet->find(productId) != largerSet->end()) {
            count++;
        }
    }
    return count;
}