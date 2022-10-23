//
// Created by YUXIN LI on 23/10/2022.
//

#ifndef SHADERS_SHADER_H
#define SHADERS_SHADER_H

#include <glad/glad.h>
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

class Shader
{
public:
    // program ID
    unsigned int ID;

    //constructor
    Shader(const char* vertexPath, const char* fragmentPath)
    {
        // 1. obtain vertex shader and fragment shader from file paths
        std::string vertexShaderCode;
        std::string fragmentShaderCode;
        std::ifstream vShaderFile; // input file stream
        std::ifstream fShaderFile;
        // make sure ifstream object can throw exceptions
        vShaderFile.exceptions(std::ifstream::failbit | std::ifstream::badbit);
        fShaderFile.exceptions(std::ifstream::failbit | std::ifstream::badbit);
        try{
            // open file
            vShaderFile.open(vertexPath);
            fShaderFile.open(fragmentPath);
            std::stringstream vShaderStream, fShaderStream;
            // read buffer to stream
            vShaderStream << vShaderFile.rdbuf();
            fShaderStream << fShaderFile.rdbuf();
            // close file
            vShaderFile.close();
            fShaderFile.close();
            // convert stream to string
            vertexShaderCode = vShaderStream.str();
            fragmentShaderCode = fShaderStream.str();
        }
        catch(std::ifstream::failure e){
            std::cout << "ERROR::SHADER::FILE_NOT_SUCCESSFULLY_READ: " << e.what() << std::endl;
        }

        // 2. edit shader
        const char* vShaderCode = vertexShaderCode.c_str();
        const char* fShaderCode = fragmentShaderCode.c_str();
        unsigned int vertex, fragment;

        // vertex shader
        vertex = glCreateShader(GL_VERTEX_SHADER);
        glShaderSource(vertex, 1, &vShaderCode, nullptr);
        glCompileShader(vertex);
        checkCompileErrors(vertex, "VERTEX");

        // fragment shader
        fragment = glCreateShader(GL_FRAGMENT_SHADER);
        glShaderSource(fragment, 1, &fShaderCode, nullptr);
        glCompileShader(fragment);
        checkCompileErrors(fragment, "FRAGMENT");

        // shader program
        ID = glCreateProgram();
        glAttachShader(ID, vertex);
        glAttachShader(ID, fragment);
        glLinkProgram(ID);
        checkCompileErrors(ID, "PROGRAM");

        // delete shader
        glDeleteShader(vertex);
        glDeleteShader(fragment);
    }

    void use(){
        glUseProgram(ID);
    }

    // uniform utility functions
    void setBool(const std::string &name, bool value) const
    {
        glUniform1i(glGetUniformLocation(ID, name.c_str()), (int) value);
    }

    void setInt(const std::string &name, int value) const
    {
        glUniform1i(glGetUniformLocation(ID, name.c_str()), value);
    }

    void setFloat(const std::string &name, float value) const
    {
        glUniform1f(glGetUniformLocation(ID, name.c_str()), value);
    }

private:
    // utility function for checking shader compilation/linking errors.
    static void checkCompileErrors(unsigned  int shader, const std::string& type){
        int success;
        char infoLog[1024];
        if (type != "PROGRAM"){
            glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
            if (!success){
                glGetShaderInfoLog(shader, 1024, nullptr, infoLog);
                std::cout << "ERROR::SHADER_COMPILATION_ERROR of type: " << type << "\n" << infoLog
                << "\n -- --------------------------------------------------- -- " << std::endl;
            }
        }
        else {
            glGetProgramiv(shader, GL_LINK_STATUS, &success);
            if (!success)
            {
                glGetProgramInfoLog(shader, 1024, nullptr, infoLog);
                std::cout << "ERROR::PROGRAM_LINKING_ERROR of type: " << type << "\n" << infoLog
                << "\n -- --------------------------------------------------- -- " << std::endl;
            }
        }
    }
};

#endif //SHADERS_SHADER_H
