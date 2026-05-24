#pragma once
#include "interfaces/IInputReader.h"
#include <iostream>

// Production input adapter that reads from keyboard/stdin.
class StandardInputReader : public IInputReader {
public:
    std::string readLine() override {
        std::string line;
        std::getline(std::cin, line);
        return line;
    }
};