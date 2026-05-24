#ifndef HELP_COMMAND_H
#define HELP_COMMAND_H

#include "../interfaces/ICommandHandler.h"
#include "data_management/StorageManager.h"

class HelpCommand : public ICommandHandler {
public:
    explicit HelpCommand(StorageManager* sm);
    std::string execute(const std::vector<std::string>& args) override;
};

#endif
