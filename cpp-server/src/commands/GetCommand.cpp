#include "GetCommand.h"
#include <sstream>

GetCommand::GetCommand(StorageManager* sm)
    : storageManager(sm), engine(*sm) {}

std::string GetCommand::execute(const std::vector<std::string>& args) {
    if (!isCommandValid(args)) {
        return "400 Bad Request";
    }

    int userId = std::stoi(args[1]);
    int productId = std::stoi(args[2]);

    //a syntactically valid GET on a user that was never created by
    // POST is logically invalid against current data -> 404 Not Found.
    if (!storageManager->userExists(userId)) {
        return "404 Not Found";
    }

    std::vector<int> recs = engine.recommend(userId, productId);

    //response format is "200 Ok" followed by exactly two newline
    // characters and then the recommendation output from Exercise 1.
    std::ostringstream oss;
    oss << "200 Ok\n\n";
    for (size_t i = 0; i < recs.size(); i++) {
        if (i > 0) {
            oss << " ";
        }
        oss << recs[i];
    }
    return oss.str();
}

bool GetCommand::isCommandValid(const std::vector<std::string>& args) {
    if (args.size() != 3) {
        return false;
    }

    try {
        std::stoi(args[1]);
        std::stoi(args[2]);
    } catch (...) {
        return false;
    }

    return true;
}
