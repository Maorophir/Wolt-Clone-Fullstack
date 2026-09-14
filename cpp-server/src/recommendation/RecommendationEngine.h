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
    // Takes the table BY VALUE and moves it into place. Callers that already
    // hold a snapshot (the server path) hand it over with zero extra copies;
    // callers holding a long-lived table (tests) still get a safe private copy.
    // The engine therefore owns its data and is immutable afterwards, which
    // makes recommend() safe to run on any thread with no locking at all.
    explicit RecommendationEngine(std::unordered_map<int, std::unordered_set<int>> watchedProductsByUser);

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