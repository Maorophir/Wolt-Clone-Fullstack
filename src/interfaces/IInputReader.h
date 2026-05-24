#pragma once
#include <string>

// Input contract for the app.
// Any source (stdin, file, socket, mock) can implement this.
class IInputReader {
public:
    virtual ~IInputReader() = default;

    // Read one full line from the input source.
    virtual std::string readLine() = 0;
};
