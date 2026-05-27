#ifndef DELETE_COMMAND_H
#define DELETE_COMMAND_H

#include "../interfaces/ICommandHandler.h"
#include "data_management/StorageManager.h"

// PRS-54: DELETE [userid] [productid1] [productid2] ...
// Removes watched products from an existing user's history.
class DeleteCommand : public ICommandHandler {
private:
    StorageManager* storageManager;

public:
    explicit DeleteCommand(StorageManager* sm);
    std::string execute(const std::vector<std::string>& args) override;
    bool isCommandValid(const std::vector<std::string>& args);
};

#endif
