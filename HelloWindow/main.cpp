#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>

void framebufferSizeCallback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

// settings
const unsigned int SCR_WIDTH = 800; // screen width
const unsigned int SCR_HEIGHT = 600; // screen height

int main() {
    // GLFW initialization and configuration
    // ------------------------------------
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE); // no extension
#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // Create a GLFW window
    // -------------------------------------
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Hello Window", nullptr, nullptr);
    if (window == nullptr){
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);

    // register callback when window size has changed.
    glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);

    // initialized GLAD, load all openGL func ptrs
    // --------------------------------------------a
    // check openGL func ptrs provided by GLFW
    if (!gladLoadGLLoader((GLADloadproc) glfwGetProcAddress)){
        std::cout << "Failed to initialize GLAD" << std::endl;
//        glfwTerminate();
        return -1;
    }

    // render loop
    while(!glfwWindowShouldClose(window)){
        // input
        // ---------------------------
        processInput(window);

        // render
        // ------------------------------
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);   // color for clear background
        glClear(GL_COLOR_BUFFER_BIT);   // clear color buffer

        // swap color buffer which will be drawn in this iteration. (double buffer, one saving, one drawing)
        glfwSwapBuffers(window);
        // check if any event (e.g. keyboard input and mouse movement) is triggered.
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}

void framebufferSizeCallback(GLFWwindow* window, int width, int height){
    // set viewport size map (-1,1) to (width, height)
    glViewport(0, 0, width, height);
}

void processInput(GLFWwindow* window){
    if(glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}
