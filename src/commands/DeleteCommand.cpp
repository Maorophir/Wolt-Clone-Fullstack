#include "DeleteCommand.h"
#include <string>

DeleteCommand::DeleteCommand(StorageManager* sm) : storageManager(sm) {}

std::string DeleteCommand::execute(const std::vector<std::string>& args) {
    if (!isCommandValid(args)) {
        return "400 Bad Request";
    }

    int userId = std::stoi(args[1]);

    if (!storageManager->userExists(userId)) {
        return "404 Not Found";
    }

    // Parse the requested product ids once, then verify every one is present
    // in the user's history before mutating any state. Partial deletion
    // would leave storage in an inconsistent place when a 404 is returned.
    std::vector<int> productIds;
    productIds.reserve(args.size() - 2);
    for (size_t i = 2; i < args.size(); i++) {
        productIds.push_back(std::stoi(args[i]));
    }

    for (int productId : productIds) {
        // PRS-54: "requested product relationship does not exist" -> 404.
        if (!storageManager->hasUserViewedProduct(userId, productId)) {
            return "404 Not Found";
        }
    }

    storageManager->deleteProductsFromUser(userId, productIds);

    return "204 No Content";
}

bool DeleteCommand::isCommandValid(const std::vector<std::string>& args) {
    // Need at least: command, userId, and one productId.
    if (args.size() < 3) {
        return false;
    }

    try {
        for (size_t i = 1; i < args.size(); i++) {
            std::stoi(args[i]);
        }
    } catch (...) {
        return false;
    }

    return true;
}
