#include "PatchCommand.h"
#include <string>

PatchCommand::PatchCommand(StorageManager* sm) : storageManager(sm) {}

std::string PatchCommand::execute(const std::vector<std::string>& args) {
    if (!isCommandValid(args)) {
        return "400 Bad Request";
    }

    int userId = std::stoi(args[1]);

    std::vector<int> productIds;
    for (size_t i = 2; i < args.size(); i++) {
        productIds.push_back(std::stoi(args[i]));
    }

    //PATCH is valid only if the user already exists (created by POST).
    //syntactically valid but logically impossible -> 404 Not Found.
    // The existence check and the append happen inside one exclusive lock:
    // checking first and appending afterwards would let a concurrent DELETE
    // (or a concurrent user removal) slip in between and resurrect the user.
    if (!storageManager->appendProductsIfUserExists(userId, productIds)) {
        return "404 Not Found";
    }

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
