#pragma once
#include <string>

// Output contract for the app.
// Any target (stdout, file, network, mock) can implement this.
class IOutputWriter {
public:
    virtual ~IOutputWriter() = default;
   
    // Write text without a new line
    virtual void write(const std::string& text) = 0;
   
    // Write text with a new line at the end
    virtual void writeLine(const std::string& text) = 0;
};