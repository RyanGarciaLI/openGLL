#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include "shader.h"

void framebufferSizeCallback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

// settings
const unsigned int SCR_WIDTH = 800; // screen width
const unsigned int SCR_HEIGHT = 600; // screen height
inline bool exists (const std::string& name);

int main() {
    // glfw initialization and configuration
    // ------------------------------------
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE); // no extension
#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // create a window
    // ------------------------------------
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "OpenGL Learning Starting", nullptr, nullptr);
    if (window == nullptr){
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    // register callback when window size has changed.
    glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);

    // initialize GLAD, load all opengl func ptrs
    // ---------------------------------------
    // check openGL func ptrs provided by GLFW
    if (!gladLoadGLLoader((GLADloadproc) glfwGetProcAddress)){
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    // build and compile shader program
    // ------------------------------------
    Shader shaderProgram("../shader.vs", "../shader.fs");

    // set up vertex data, configure vertex attributes
    // -----------------------------------------------
    // a triangle
    float vertices[] = {
            // position                     // color
            -.5f, -0.5f, 0.0f, 1.0f, 0.0f, 0.0f,   // lower right
            0.5f, -0.5f, 0.0f, 0.0f, 1.0f, 0.0f, // lower left
            0.0f, 0.5f, 0.0f, 0.0f, 0.0f, 1.0f  // top
    };

    unsigned int VAO; // vertex array object
    glGenVertexArrays(1, &VAO);
    unsigned int VBO; // vertex buffer object
    glGenBuffers(1, &VBO);

    // bind VAO first, then bind and set VBO, finally configure vertex attributes
    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW); // copy vertex data to GPU Memory
    // STATIC_DRAW - nearly change, DYNAMIC_DRAW - frequently change STREAM_DRAW - change every draw

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*) nullptr);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*) (3*sizeof(float )));
    // attrib id, len of attrib, data type, normalize or not, stride, offset
    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    // unbind buffer
    // ------------------------------
    // reset bound buffer. glVertexAttribPointer has registered VBO as the vertex attribute's bound VBO
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    // ATTENTION! do not unbind EBO while a VAO is active as the bound EBO is store in VAO
    //glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0); // DO NOT DO THAT.
    // reset bound vertex array, other VAO calls won't accidentally modify this VAO.
    glBindVertexArray(0);

    // uncomment this call to draw in wireframe polygons.
    // glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    // render loop
    while(!glfwWindowShouldClose(window)){
        // input
        // ----------------
        processInput(window);

        // render
        // ----------------
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f); // color for clear
        glClear(GL_COLOR_BUFFER_BIT); // clear color buffer

        shaderProgram.use(); // activate shader program

        // update uniform color
//        float timeValue = glfwGetTime();
//        float greenValue = (sin(timeValue) / 2.0f) + 0.5f;
//        int vertexColorLocation = glGetUniformLocation(shaderProgram, "uniColor");
        // look up uniform location doesn't need UseProgram()
//        glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);
        // update uniform needs UseProgram()

        glBindVertexArray(VAO); // bind it before use, since we only have a single VAO, this step is unnecessary.
        // draw a triangle
        glDrawArrays(GL_TRIANGLES, 0, 3); // primitive, starting index, # of vertices

        glBindVertexArray(0);

        // swap color buffer which will be drawn in this iteration. (double buffer, one saving, one drawing)
        glfwSwapBuffers(window);
        // check if any event (e.g. keyboard input and mouse movement) is triggered.
        glfwPollEvents();
    }

    // optional: release all resources once they've outlived their purpose:
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);

    glfwTerminate();
    return 0;
}

void framebufferSizeCallback(GLFWwindow* window, int width, int height){
    // set viewport size, map (-1,1) to (width, height)
    glViewport(0, 0, width, height);
}

void processInput(GLFWwindow * window){
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}
#include <sys/stat.h>

inline bool exists (const std::string& name) {
    struct stat buffer;
    return (stat (name.c_str(), &buffer) == 0);
}



