#version 330 core
in vec2 texCoord;
out vec4 FragColor;
uniform sampler2D boundary_texture;	//boundary texture map specifying boundaries
uniform sampler2D state_texture3;	    //input texture containing f0, rho, ux and uy
uniform vec2 image_size;
uniform vec2 mousePos;

void main()
{
	//	TO DO: More sophisticated display output


  	vec2 pos = texCoord.xy;		//	Position of each lattice node
  	// for test mouse input only
	float dist = (pos.x - mousePos.x) * (pos.x - mousePos.x) + (pos.y - mousePos.y) * (pos.y - mousePos.y);
	if (dist < 0.00001 )
	{
	    FragColor = vec4( 1.0f, 0.0f, 0.0f, 0.0f );
	}
	else if (texture(boundary_texture, pos).x > 0.5)
	{
		// fluid
		float color = texture( state_texture3, pos ).y; // rho
		FragColor = vec4( color*0.4, color*0.6, color, 0.0 );
	}
	else 
	{	// boundaries
		if ((pos.x * image_size.x < 2.0f) || (pos.x * image_size.x > image_size.x - 3.0f) || (pos.y * image_size.y < 2.0f) || (pos.y * image_size.y > image_size.y - 3.0f))
		{	// domain boundaries
			FragColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
		}
		else
		{	// obstacle boundaries
			FragColor = vec4(texture(boundary_texture, pos).rbg, 0.0f);
		}
	}	
}