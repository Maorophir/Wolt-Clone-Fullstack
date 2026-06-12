#include "PatchCommand.h"
#include <string>

PatchCommand::PatchCommand(StorageManager* sm) : storageManager(sm) {}

std::string PatchCommand::execute(const std::vector<std::string>& args) {
    if (!isCommandValid(args)) {
        return "400 Bad Request";
    }

    int userId = std::stoi(args[1]);

    //PATCH is valid only if the user already exists (created by POST).
    //syntactically valid but logically impossible -> 404 Not Found.
    if (!storageManager->userExists(userId)) {
        return "404 Not Found";
    }

    std::vector<int> productIds;
    for (size_t i = 2; i < args.size(); i++) {
        productIds.push_back(std::stoi(args[i]));
    }

    storageManager->addProductsToUser(userId, productIds);

    return "204 No Content";
}

bool PatchCommand::isCommandValid(const std::vector<std::string>& args) {
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
