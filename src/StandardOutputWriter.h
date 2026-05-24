#pragma once
#include "interfaces/IOutputWriter.h"
#include <iostream>

// Production output adapter that writes to stdout.
class StandardOutputWriter : public IOutputWriter {
public:
    void write(const std::string& text) override {
        std::cout << text;
    }
    
    void writeLine(const std::string& text) override {
        std::cout << text << std::endl;
    }
};