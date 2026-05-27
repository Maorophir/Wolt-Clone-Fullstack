#include <gtest/gtest.h>

#include "../recommendation/RecommendationEngine.h"

#include <unordered_map>
#include <unordered_set>
#include <vector>

TEST(RecommendationEngineTest, ReturnsAppendixRecommendations)
{
    std::unordered_map<int, std::unordered_set<int>> watchedProductsByUser = {
        {1, {100, 101, 102, 103}},
        {2, {101, 102, 104, 105, 106}},
        {3, {100, 104, 105, 107, 108}},
        {4, {101, 105, 106, 107, 109, 110}},
        {5, {100, 102, 103, 105, 108, 111}},
        {6, {100, 103, 104, 110, 111, 112, 113}},
        {7, {102, 105, 106, 107, 108, 109, 110}},
        {8, {101, 104, 105, 106, 109, 111, 114}},
        {9, {100, 103, 105, 107, 112, 113, 115}},
        {10, {100, 102, 105, 106, 107, 109, 110, 116}}
    };

    RecommendationEngine engine(watchedProductsByUser);

    std::vector<int> actual = engine.recommend(1, 104);

    std::vector<int> expected = {
        105, 106, 111, 110, 112, 113, 107, 108, 109, 114
    };

    EXPECT_EQ(expected, actual);
} 

TEST(RecommendationEngineTest, ReturnsEmptyForUnknownUser)
{
    std::unordered_map<int, std::unordered_set<int>> data = {
        {1, {100, 101}}
    };
    RecommendationEngine engine(data);

   // Request recommendations for user 99, who does not exist
    std::vector<int> actual = engine.recommend(99, 100);
    
    EXPECT_TRUE(actual.empty());
}

TEST(RecommendationEngineTest, ReturnsEmptyWhenNoOneElseWatchedProduct)
{
    std::unordered_map<int, std::unordered_set<int>> data = {
        {1, {100, 200}}, // Our user watched product 200
        {2, {100, 300}}, // Another user did not watch product 200
        {3, {100, 400}}  // This user did not watch it either
    };
    RecommendationEngine engine(data);

    // Request recommendations based on product 200
    std::vector<int> actual = engine.recommend(1, 200);
    
    EXPECT_TRUE(actual.empty());
}

TEST(RecommendationEngineTest, SortsByScoreThenByProductId)
{
    std::unordered_map<int, std::unordered_set<int>> data = {
        {1, {10, 20, 30}},
        {2, {10, 20, 40, 50}},
        {3, {10, 30, 40, 60}}
    };
    RecommendationEngine engine(data);

    /*
     * Internal calculation for user 1 and product 10:
     * User 2: similarity 2 -> contributes 2 points to products 40 and 50.
     * User 3: similarity 2 -> contributes 2 points to products 40 and 60.
     * Final score:
     * Product 40 = 4 points
     * Product 50 = 2 points
     * Product 60 = 2 points
     * Expected order: 40, then 50 and 60 (tie broken by product ID).
     */
    std::vector<int> actual = engine.recommend(1, 10);
    std::vector<int> expected = {40, 50, 60};
    
    EXPECT_EQ(expected, actual);
}