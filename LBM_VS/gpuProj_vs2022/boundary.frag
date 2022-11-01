#version 330 core
in vec2 texCoord;
out vec4 FragColor;
uniform sampler2D boundary_texture;
uniform image_size;
uniform vec2 moveDir;

void main()
{
	vec2 pos = texCoord.xy;
	float u = pos.x * image_size.x;
	float v = pos.y * image_size.y;
	if(u < 2.0 || u > image_size.x - 3.0 || v < 2.0 || v > image_size.y - 3.0){
		// domain boundary
		return;
	}

	// potential obstacl boundary
	prePos = pos - moveDir / image_size; // previous texel position
	if (texture(boundary_texture, prePos) <= 0.5)
	{
		
	}
}