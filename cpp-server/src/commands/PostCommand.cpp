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
    if (storageManager->userExists(userId)) {
        return "404 Not Found";
    }

    std::vector<int> productIds;
    for (size_t i = 2; i < args.size(); i++) {
        productIds.push_back(stoi(args[i]));
    }

    storageManager->addProductsToUser(userId, productIds);
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
