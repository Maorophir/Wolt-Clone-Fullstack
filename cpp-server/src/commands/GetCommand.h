#ifndef GET_COMMAND_H
#define GET_COMMAND_H

#include "../interfaces/ICommandHandler.h"
#include "data_management/StorageManager.h"
#include "recommendation/StoredRecommendationEngine.h"

class GetCommand : public ICommandHandler {
private:
    StorageManager* storageManager;
    StoredRecommendationEngine engine;

public:
    explicit GetCommand(StorageManager* sm);
    std::string execute(const std::vector<std::string>& args) override;
    bool isCommandValid(const std::vector<std::string>& args);
};

#endif
