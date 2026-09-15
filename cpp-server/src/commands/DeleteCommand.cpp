#include "DeleteCommand.h"
#include <string>

DeleteCommand::DeleteCommand(StorageManager* sm) : storageManager(sm) {}

std::string DeleteCommand::execute(const std::vector<std::string>& args) {
    if (!isCommandValid(args)) {
        return "400 Bad Request";
    }

    int userId = std::stoi(args[1]);

    // Parse the requested product ids once, then verify every one is present
    // in the user's history before mutating any state. Partial deletion
    // would leave storage in an inconsistent place when a 404 is returned.
    std::vector<int> productIds;
    productIds.reserve(args.size() - 2);
    for (size_t i = 2; i < args.size(); i++) {
        productIds.push_back(std::stoi(args[i]));
    }

    // The verify loop and the erase loop used to be separate locked calls:
    // between them another thread could delete one of the products, so this
    // request could report 204 while removing something that was already gone,
    // or erase a prefix of the list and then bail out on a 404. Doing the whole
    // verify-then-erase sequence inside one exclusive lock makes the delete
    // all-or-nothing, and makes exactly one of N concurrent identical DELETEs
    // return 204 while the rest correctly return 404.
    if (!storageManager->deleteProductsIfAllPresent(userId, productIds)) {
        //"requested product relationship does not exist" -> 404.
        return "404 Not Found";
    }

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
