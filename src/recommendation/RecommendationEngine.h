#pragma once

#include "../interfaces/IRecommendationEngine.h"

#include <unordered_map>
#include <unordered_set>
#include <vector>

/*
 * Creates product recommendations from the watched-products table.
 *
 * The engine works only with data that was already loaded into memory:
 *      user id -> set of watched product ids
 *
 * It does not read from files and does not print output.
 */
class RecommendationEngine : public IRecommendationEngine
{
public:
    /*
     * Builds the recommendation engine from the current user-product table.
     *
     * The similarity matrix is calculated once from this table and then used
     * as the weight source during recommendation.
     */
    RecommendationEngine(const std::unordered_map<int, std::unordered_set<int>>& watchedProductsByUser);

    /*
     * Returns up to 10 recommended product ids for the given user and product.
     *
     * The algorithm looks at users who watched the requested product, gives
     * each of them a weight according to their similarity with the target user,
     * and uses those weights to rank candidate products.
     */
    std::vector<int> recommend(int userId, int productId) const;

private:
    /*
     * Main data table:
     *      user id -> products watched by that user
     */
    std::unordered_map<int, std::unordered_set<int>> watchedProductsByUser;

    int countCommonProducts(const std::unordered_set<int>& firstProducts,
                                const std::unordered_set<int>& secondProducts) const;
};