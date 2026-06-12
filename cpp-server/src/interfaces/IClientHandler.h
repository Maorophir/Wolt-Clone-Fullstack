#pragma once
#include <string>

// Interface for handling business logic decoupled from network logic
class IClientHandler {
public:
    virtual ~IClientHandler() = default;
   
    // Receives a string command and returns the string response
    virtual std::string handleRequest(const std::string& request) = 0;
};