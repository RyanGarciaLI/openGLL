#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>

void framebufferSizeCallback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

// settings
const unsigned int SCR_WIDTH = 800; // screen width
const unsigned int SCR_HEIGHT = 600; // screen height
const char *vertexShaderSource = "#version 330 core\n"
                                 "layout (location = 0) in vec3 aPos;\n"
                                 "layout (location = 1) in vec3 aCol;\n"
                                 "out vec3 color;\n"
                                 "void main()\n"
                                 "{\n"
                                 "  gl_Position = vec4(aPos, 1.0);\n"
                                 "  color = aCol;\n"
                                 "}\n";
const char *fragmentShaderSource = "#version 330 core\n"
                                   "in vec3 color;\n"
                                   "out vec4 FragColor;\n"
                                   "void main(){\n"
                                   "    FragColor = vec4(color, 1.0f);\n"
                                   "}\n";

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
    // vertex shader
    unsigned int vertexShader;
    vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, nullptr); // shader, num of sources, source, ignore
    glCompileShader(vertexShader);
    // check if shader compilation is successful or not
    int success;
    char infoLog[512];
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if(!success){
        glGetShaderInfoLog(vertexShader, 512, nullptr, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    // fragment shader
    unsigned int fragmentShader;
    fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, nullptr);
    glCompileShader(fragmentShader);
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success){
        glGetShaderInfoLog(fragmentShader, 512, nullptr, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    // link shaders to a program
    unsigned int shaderProgram;
    shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glBindAttribLocation(shaderProgram, 0, "aPos");
    glBindAttribLocation(shaderProgram, 1, "aCol");
    glLinkProgram(shaderProgram);
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, nullptr, infoLog);
        std::cout << "ERROR::SHADER PROGRAM::LINK_FAILED\n" << infoLog << std::endl;
    }

    // delete shaders, they won't be used anymore.
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    // set up vertex data, configure vertex attributes
    // -----------------------------------------------
    // two triangles
//    float vertices[] = {
//            // first triangle
//            -0.9f, -0.5f, 0.0f,  // left
//            -0.0f, -0.5f, 0.0f,  // right
//            -0.45f, 0.5f, 0.0f,  // top
//            // second triangle
//            0.0f, 0.5f, 0.0f,  // left
//            0.9f, 0.5f, 0.0f,  // right
//            0.45f, -0.5f, 0.0f   // down
//    };

    float colors[] = {
            1.0f, 0.0f, 0.0f,
            0.0f, 1.0f, 0.0f,
            0.0f, 0.0f, 1.0f,
            0.8f, 0.1f, 0.1f,
            0.1f, 0.1f, 0.8f,
            0.1f, 0.8f, 0.1f
    };

    // a rectangle
    float vertices[] = {
            0.5f, 0.5f, 0.0f,
            0.5f, -0.5, 0.0f,
            -0.5f, -0.5f, 0.0f,
            -0.5f, 0.5f, 0.0f
    };

    // indexed drawing
    unsigned int indices[] = {
            // index starts from 0
            0, 1, 3,    // 1st triangle
            1, 2,3 // 2nd triangle
    };

    unsigned int VAO; // vertex array object
    glGenVertexArrays(1, &VAO);
    unsigned int VBO_vertices; // vertex buffer object
    glGenBuffers(1, &VBO_vertices);
    unsigned int VBO_colors;
    glGenBuffers(1, &VBO_colors);

    // bind VAO first, then bind and set VBO_vertices, finally configure vertex attributes
    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO_vertices);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW); // copy vertex data to GPU Memory
    // STATIC_DRAW - nearly change, DYNAMIC_DRAW - frequently change STREAM_DRAW - change every draw
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*) nullptr);

    glBindBuffer(GL_ARRAY_BUFFER, VBO_colors);  // override
    glBufferData(GL_ARRAY_BUFFER, sizeof(colors), colors, GL_STATIC_DRAW);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*) nullptr);

    unsigned int EBO; // element buffer object, or say index buffer object
    glGenBuffers(1, &EBO);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

    // attrib id, len of attrib, data type, normalize or not, stride, offset
    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    // unbind buffer
    // ------------------------------
    // reset bound buffer. glVertexAttribPointer has registered VBO_vertices as the vertex attribute's bound VBO_vertices
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    // ATTENTION! do not unbind EBO while a VAO is active as the bound EBO is store in VAO
    //glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0); // DO NOT DO THAT.
    // reset bound vertex array, other VAO calls won't accidentally modify this VAO.
    glBindVertexArray(0);

    // uncomment this call to draw in wireframe polygons.
//     glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    // render loop
    while(!glfwWindowShouldClose(window)){
        // input
        // ----------------
        processInput(window);

        // render
        // ----------------
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f); // color for clear
        glClear(GL_COLOR_BUFFER_BIT); // clear color buffer

        glUseProgram(shaderProgram); // activate shader program

        glBindVertexArray(VAO); // bind it before use, since we only have a single VAO, this step is unnecessary.
        // draw a triangle
        //glDrawArrays(GL_TRIANGLES, 0, 6); // primitive, starting index, # of vertices
        // draw a rectangle
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0); // # of vertices, index type, offset

        glBindVertexArray(0);

        // swap color buffer which will be drawn in this iteration. (double buffer, one saving, one drawing)
        glfwSwapBuffers(window);
        // check if any event (e.g. keyboard input and mouse movement) is triggered.
        glfwPollEvents();
    }

    // optional: release all resources once they've outlived their purpose:
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO_vertices);
    glDeleteBuffers(1, &EBO);
    glDeleteProgram(shaderProgram);

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


