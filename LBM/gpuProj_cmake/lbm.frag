#version 330 core
in vec2 texCoord;
out vec4 FragColor[3];
uniform sampler2D boundary_texture;   //boundary texture map specifying boundaries
uniform sampler2D state_texture1;        //input texture containing f1-f4
uniform sampler2D state_texture2;        //input texture containing f5-f8
uniform sampler2D state_texture3;        //input texture containing f0, rho, ux and uy
uniform vec2 image_size;
uniform float tau;			//	Tau is corresponding to Viscosity and is used to evaluate feq (collision term).

void main()
{
    vec2 e[9];	//	9 lattice velocities
    float w[9];	//	9 lattice constants
	int width, height;
    
	e[0] = vec2( 0, 0);
	e[1] = vec2( 1, 0);
	e[2] = vec2( 0, 1);
	e[3] = vec2(-1, 0);
	e[4] = vec2( 0,-1);
	e[5] = vec2( 1, 1);
	e[6] = vec2(-1, 1);
	e[7] = vec2(-1,-1);
	e[8] = vec2( 1,-1);

	w[0] = 4.0/9.0;
	w[1] = 1.0/9.0;
	w[2] = 1.0/9.0;
	w[3] = 1.0/9.0;
	w[4] = 1.0/9.0;
	w[5] = 1.0/36.0;
	w[6] = 1.0/36.0;
	w[7] = 1.0/36.0;
	w[8] = 1.0/36.0;

	width = 800; // TODO
	height = 600; // TODO

	vec2 pos = texCoord.xy;		//position of each lattice node	
	if ( texture( boundary_texture,pos ).x > 0.5 )
    {	//	Node is 'Fluid'
        float ff[9];// = {0.0};
        float rho = 0.0;
        vec2 u = vec2(0.0,0.0);

		// streaming step
		ff[0] = texture(state_texture3, pos).x;

		ff[1] = texture(state_texture1, pos - e[1]).x;
		ff[2] = texture(state_texture1, pos - e[2]).y;
		ff[3] = texture(state_texture1, pos - e[3]).z;
		ff[4] = texture(state_texture1, pos - e[4]).w;

		ff[5] = texture(state_texture2, pos - e[5]).x;
		ff[6] = texture(state_texture2, pos - e[6]).y;
		ff[7] = texture(state_texture2, pos - e[7]).z;
		ff[8] = texture(state_texture2, pos - e[8]).w;

		// collision step
		for (int i = 0; i < 9; i++){
			rho = rho + ff[i];
		}

		for (int i = 0; i < 9; i++){
			u = u + ff[i] * e[i];
		}
		
		u /= rho;

		float feq;
		float uu_dot = u.x * u.x + u.y * u.y;
		for (int i = 0; i < 9; i++){
			float eu_dot = (e[i].x * u.x + e[i].y * u.y);
			feq = w[i] * rho * (1.0f + 3.0f * eu_dot + 4.5f * eu_dot * eu_dot - 1.5f * uu_dot);
			ff[i] = ff[i] - (ff[i] - feq) / tau;
		}
        
      	FragColor[0] = vec4( ff[1], ff[2], ff[3], ff[4] );
      	FragColor[1] = vec4( ff[5], ff[6], ff[7], ff[8] );
      	FragColor[2] = vec4( ff[0], rho, u.x, u.y );        
	} 
    else 
    {	//	Node is 'Solid'
		//	To do: Handle the boundary condition here
		float rho, ux, uy;
		float ff[9];// = {0.0};
		ff[1] = texture(state_texture1, pos).x;
		ff[2] = texture(state_texture1, pos).y;
		ff[3] = texture(state_texture1, pos).z;
		ff[4] = texture(state_texture1, pos).w;
		
		ff[5] = texture(state_texture2, pos).x;
		ff[6] = texture(state_texture2, pos).y;
		ff[7] = texture(state_texture2, pos).z;
		ff[8] = texture(state_texture2, pos).w;
		
		ff[0] = texture(state_texture3, pos).x;
		rho = texture(state_texture3, pos).y;
		ux = texture(state_texture3, pos).z;
		uy = texture(state_texture3, pos).w;

		//	Following are DUMMY code only
	    FragColor[0] = vec4(ff[3], ff[4], ff[1], ff[2]);
	    FragColor[1] = vec4( ff[7], ff[8], ff[5], ff[6] );
      	FragColor[2] = vec4( ff[0], rho, ux, uy );  
	}
}