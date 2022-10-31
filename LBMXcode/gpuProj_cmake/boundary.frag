#version 330 core
in vec2 texCoord;
out vec4 FragColor;
uniform sampler2D boundary_texture;
uniform vec2 image_size;

void main(){
    vec2 uv = texCoord.xy;
    
}
