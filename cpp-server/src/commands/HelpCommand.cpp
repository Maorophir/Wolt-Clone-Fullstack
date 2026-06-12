#include "HelpCommand.h"

HelpCommand::HelpCommand(StorageManager* /*sm*/) {}

std::string HelpCommand::execute(const std::vector<std::string>& /*args*/) {
    //commands listed alphabetically, with `help` pinned last.
    // Argument-bearing commands use the "COMMAND, arguments: ..." format.
    // The GET line is exact per the PR; PATCH/DELETE follow the same Ex1
    // [userid] [productid1] [productid2] ... convention.
    // No trailing newline on the last line: the TCP server appends one.
    return
        "DELETE, arguments: [userid] [productid1] [productid2] ...\n"
        "GET, arguments: [userid] [productid]\n"
        "PATCH, arguments: [userid] [productid1] [productid2] ...\n"
        "POST, arguments: [userid] [productid1] [productid2] ...\n"
        "help";
}
