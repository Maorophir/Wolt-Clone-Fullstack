#pragma once

#include <map>
#include <memory>
#include <string>
#include <vector>
#include "interfaces/ICommandHandler.h"
#include "interfaces/IClientHandler.h"
#include "data_management/StorageManager.h"

// Parses user input strings and dispatches to command handlers.
// Acts as the IClientHandler so the TCP server can call into the
// command pipeline without knowing about parsing or storage.
class CommandParser : public IClientHandler {
private:
    StorageManager watchList;

public:
    explicit CommandParser(const std::string& dataFile = "data/user_history.txt");

    std::string handleRequest(const std::string& request) override {
        return processCommand(request);
    }

    std::map<std::string, std::unique_ptr<ICommandHandler>> commands;
    std::string processCommand(const std::string& line);
    std::vector<std::string> parseCommand(const std::string& line);
};
