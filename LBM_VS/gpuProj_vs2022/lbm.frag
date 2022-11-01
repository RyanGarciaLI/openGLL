#version 330 core
in vec2 texCoord;
out vec4 FragColor[3];
uniform sampler2D boundary_texture;   //boundary texture map specifying boundaries
uniform sampler2D state_texture1;        //input texture containing f1-f4
uniform sampler2D state_texture2;        //input texture containing f5-f8
uniform sampler2D state_texture3;        //input texture containing f0, rho, ux and uy
uniform vec2 image_size;
uniform float tau;            //    Tau is corresponding to Viscosity and is used to evaluate feq (collision term).
uniform vec2 mousePos;
uniform float time;


bool isDomainBoundary(vec2 uv){
    return uv.x * image_size.x < 2.0 || uv.x * image_size.x > image_size.x - 3.0 || uv.y * image_size.y < 2.0 || uv.y * image_size.y > image_size.y - 3.0;
}

vec4 getBoundaryColor(){
    float t = time / 1.0;
    vec2 offset = vec2(0.05 * sin(t), cos(t) / 6.0);
    vec2 bUV = fract(texCoord.xy + offset); // boundary position
    if (isDomainBoundary(bUV)){
        // doesn't move or render domain boundaries in obstacles shifting.
        return vec4(1.0, 0.0, 0.0, 0.0); // not a boundary
    }
    
    return vec4(texture(boundary_texture, bUV).rbg, 0.0);
}

void main()
{
    vec2 e[9];    //    9 lattice velocities
    float w[9];    //    9 lattice constants
    
    e[0] = vec2( 0.0, 0.0);
    e[1] = vec2( 1.0, 0.0);
    e[2] = vec2( 0.0, 1.0);
    e[3] = vec2(-1.0, 0.0);
    e[4] = vec2( 0.0,-1.0);
    e[5] = vec2( 1.0, 1.0);
    e[6] = vec2(-1.0, 1.0);
    e[7] = vec2(-1.0,-1.0);
    e[8] = vec2( 1.0,-1.0);

    w[0] = 4.0/9.0;
    w[1] = 1.0/9.0;
    w[2] = 1.0/9.0;
    w[3] = 1.0/9.0;
    w[4] = 1.0/9.0;
    w[5] = 1.0/36.0;
    w[6] = 1.0/36.0;
    w[7] = 1.0/36.0;
    w[8] = 1.0/36.0;
    
    vec2 pos = texCoord.xy;        //position of each lattice node
    
    // data to be store later
    float ff[9]; // fluid distribution
    float rho = 0.0; // macroscopic density
    vec2 u = vec2(0.0,0.0); // macroscopic velocity
    
    // put here to reduce sampling.
    ff[0] = texture(state_texture3, pos).x;
    rho = texture(state_texture3, pos).y;
    u.x = texture(state_texture3, pos).z;
    u.y = texture(state_texture3, pos).w;
    
    // note change sequence to improve performance as sampling frequently costs a lot.
    if (isDomainBoundary(pos))
    { // Node is domain boundary
        // flip f
        ff[3] = texture(state_texture1, pos).x;
        ff[4] = texture(state_texture1, pos).y;
        ff[1] = texture(state_texture1, pos).z;
        ff[2] = texture(state_texture1, pos).w;
        
        ff[7] = texture(state_texture2, pos).x;
        ff[8] = texture(state_texture2, pos).y;
        ff[5] = texture(state_texture2, pos).z;
        ff[6] = texture(state_texture2, pos).w;
    }
    else{
        // streaming step, fluid distribution propagate
        ff[1] = texture(state_texture1, pos - e[1] / image_size).x;
        ff[2] = texture(state_texture1, pos - e[2] / image_size).y;
        ff[3] = texture(state_texture1, pos - e[3] / image_size).z;
        ff[4] = texture(state_texture1, pos - e[4] / image_size).w;
        ff[5] = texture(state_texture2, pos - e[5] / image_size).x;
        ff[6] = texture(state_texture2, pos - e[6] / image_size).y;
        ff[7] = texture(state_texture2, pos - e[7] / image_size).z;
        ff[8] = texture(state_texture2, pos - e[8] / image_size).w;
        
        vec4 boundaryColor = getBoundaryColor();
        if ( boundaryColor.r > 0.5)
        {    // Node is 'Fluid'
            // collision step
            rho = 0.0;
            for (int i = 0; i < 9; i++){
                rho += ff[i];
            }

            
            u = vec2(0.0,0.0);
            for (int i = 0; i < 9; i++){
                u += ff[i] * e[i];
            }
            
            u = u / rho;
            
            
            float dist = distance(pos, mousePos);
            vec2 radiusVec = vec2(10.0, 10.0) / image_size;
            if (dist <= length(radiusVec) ){
                rho += 0.5;
                // u = vec2(0.0, 0.0);
            }
            
            float feq; // equilibrium density distribution
            float uu_dot = dot(u, u);
            for (int i = 0; i < 9; i++){
                float eu_dot = dot(e[i], u);
                feq = w[i] * rho * (1.0f + 3.0f * eu_dot + 4.5f * eu_dot * eu_dot - 1.5f * uu_dot);
                ff[i] = ff[i] + (feq - ff[i]) / tau; // update fluid distribution
            }
        }
        else
        {   // Node is obstacle
            float tmp;
            tmp = ff[1];
            ff[1] = ff[3];
            ff[3] = tmp;
            
            tmp = ff[2];
            ff[2] = ff[4];
            ff[4] = tmp;
            
            tmp = ff[5];
            ff[5] = ff[7];
            ff[7] = tmp;
            
            tmp = ff[6];
            ff[6] = ff[8];
            ff[8] = tmp;
        }
    }
    
    // store data
    FragColor[0] = vec4( ff[1], ff[2], ff[3], ff[4] );
    FragColor[1] = vec4( ff[5], ff[6], ff[7], ff[8] );
    FragColor[2] = vec4( ff[0], rho, u.x, u.y );
}