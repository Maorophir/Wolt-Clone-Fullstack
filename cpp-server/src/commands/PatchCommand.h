#ifndef PATCH_COMMAND_H
#define PATCH_COMMAND_H

#include "../interfaces/ICommandHandler.h"
#include "data_management/StorageManager.h"

//PATCH [userid] [productid1] [productid2] ...
// Appends watched products to an existing user (created via POST).
class PatchCommand : public ICommandHandler {
private:
    StorageManager* storageManager;

public:
    explicit PatchCommand(StorageManager* sm);
    std::string execute(const std::vector<std::string>& args) override;
    bool isCommandValid(const std::vector<std::string>& args);
};

#endif
