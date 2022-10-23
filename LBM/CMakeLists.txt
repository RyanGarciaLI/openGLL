cmake_minimum_required(VERSION 3.15)
project(gpuProj_cmake)

set(CMAKE_CXX_STANDARD 11)

find_package(glfw3 REQUIRED)
include_directories("/usr/include"
        "${PROJECT_SOURCE_DIR}/gl_libs/include")

add_executable(gpuProj gpuProj_cmake/simulation.cpp gpuProj_cmake/glad.c)
target_link_libraries(gpuProj glfw dl)