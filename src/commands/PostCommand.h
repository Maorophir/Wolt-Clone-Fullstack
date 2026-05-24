#ifndef POST_COMMAND_H
#define POST_COMMAND_H

#include <thread>
#include <mutex>

#include "../interfaces/ICommandHandler.h"
#include "data_management/StorageManager.h"

class PostCommand : public ICommandHandler {
private:
    StorageManager* storageManager;


public:
    explicit PostCommand(StorageManager* sm);
    std::string execute(const std::vector<std::string>& args) override;
    bool isCommandValid(const std::vector<std::string>& args);
};

#endif