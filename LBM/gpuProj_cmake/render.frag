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

  	vec2 e = vec2(1.0, -1.0);
  	e = e / image_size;
  	vec2 pos = texCoord.xy;		//	Position of each lattice node
  	float dist = (pos.x - mousePos.x) * (pos.x - mousePos.x) + (pos.y - mousePos.y) * (pos.y - mousePos.y);
	//	Following are for dummy display
	if (dist < 0.00001 ){
	    FragColor = vec4( 1.0f, 0.0f, 0.0f, 0.0f );
	}
	else if (texture(boundary_texture, pos).x > 0.5){
		float color = texture( state_texture3, pos ).y;
		FragColor = vec4( color*0.4, color*0.6, color, 0.0 );
	}
	else {
		if ((pos.x * image_size.x < 2.0f) || (pos.x * image_size.x > image_size.x - 3.0f) || (pos.y * image_size.y < 2.0f) || (pos.y * image_size.y > image_size.y - 3.0f)){
			FragColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
		}
		else{
			FragColor = vec4(texture(boundary_texture, pos).rbg, 0.0f);
		}
		
		// float color = texture( state_texture3, pos ).y;
		// color = 1.0f;
		// FragColor = vec4( color*0.4, color*0.4, color*0.2, 0.0 );
	}	
}