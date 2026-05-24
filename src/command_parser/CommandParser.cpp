#include "CommandParser.h"
#include <sstream>
#include <string>
#include "commands/PostCommand.h"
#include "commands/HelpCommand.h"
#include "commands/GetCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"

CommandParser::CommandParser(const std::string& dataFile) : watchList(dataFile) {
    commands["post"]   = std::make_unique<PostCommand>(&watchList);
    commands["help"]   = std::make_unique<HelpCommand>(&watchList);
    commands["get"]    = std::make_unique<GetCommand>(&watchList);
    commands["patch"]  = std::make_unique<PatchCommand>(&watchList);
    commands["delete"] = std::make_unique<DeleteCommand>(&watchList);
}

std::string CommandParser::processCommand(const std::string& line) {
    std::vector<std::string> args = parseCommand(line);
    if (args.empty()) {
        return "400 Bad Request";
    }

    // Convert command keyword to lowercase. Unknown / unsupported commands
    // (including the old Ex1 `recommend` keyword) fall through to 400 below.
    std::string cmdName = args[0];
    for (auto& c : cmdName) {
        c = tolower(c);
    }

    if (commands.count(cmdName)) {
        return commands[cmdName]->execute(args);
    }
    // PRS-57: malformed or unsupported command -> 400 Bad Request.
    return "400 Bad Request";
}

// Split the line into whitespace-separated tokens.
std::vector<std::string> CommandParser::parseCommand(const std::string& line) {
    std::vector<std::string> args;
    std::istringstream iss(line);
    std::string arg;

    while (iss >> arg) {
        args.push_back(arg);
    }

    return args;
}
