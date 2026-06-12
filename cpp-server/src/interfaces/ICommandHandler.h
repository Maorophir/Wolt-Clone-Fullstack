#pragma once

#include <vector>
#include <string>

// Abstract interface for command handlers.
// Enables the Open/Closed Principle so the app can support new commands
// without modifying the dispatcher or application logic.
class ICommandHandler {
public:
    virtual ~ICommandHandler() = default;
   
    // Process the command with the provided arguments.
    virtual std::string execute(const std::vector<std::string>& args) = 0;
};
