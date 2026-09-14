#include "PostCommand.h"
#include <iostream>
#include <algorithm>
#include <string>

PostCommand::PostCommand(StorageManager* sm) : storageManager(sm) {}

std::string PostCommand::execute(const std::vector<std::string>& args) {
    if (!isCommandValid(args)) {
        return "400 Bad Request";
    }

    int userId = stoi(args[1]);

    std::vector<int> productIds;
    for (size_t i = 2; i < args.size(); i++) {
        productIds.push_back(stoi(args[i]));
    }

    // Single atomic "create if absent" instead of userExists() followed by
    // addProductsToUser(). Those were two separate critical sections, so two
    // threads POSTing the same user could both see "absent" and both answer
    // 201 Created for one user - a classic check-then-act (TOCTOU) race.
    // createUserWithProducts() does the check and the insert under one
    // exclusive lock, so exactly one caller ever gets 201.
    if (!storageManager->createUserWithProducts(userId, productIds)) {
        return "404 Not Found";
    }

    return "201 Created";
}

bool PostCommand::isCommandValid(const std::vector<std::string>& args) {
    if (args.size() < 3) {
        return false; // Need at least command, userId, and one productId
    }

  try {
        for (size_t i = 1; i < args.size(); i++) {
            stoi(args[i]);
        }
    } catch (...) {
        return false;
   
    }

    return true;
}
