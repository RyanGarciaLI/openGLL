cmake_minimum_required(VERSION 3.23)
project(HelloTriangle)

set(CMAKE_CXX_STANDARD 11)

include_directories(./libs/glad/include)
include_directories(/usr/local/Cellar/glfw/3.3.8/include)
link_directories(/usr/local/Cellar/glfw/3.3.8/lib)

add_executable(HelloTriangle
        ./libs/glad/src/glad.c
        main.cpp)

target_link_libraries(
        HelloTriangle
        glfw
)
