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
    
    if ( texture( boundary_texture,pos ).x > 0.5)
    {    //    Node is 'Fluid'
        float ff[9];// = {0.0};
        float rho = 1.0;
        vec2 u = vec2(0.0,0.0);

        float xp = pos.x * image_size.x > image_size.x - 2.0    ?                    0./ image_size.x   : (pos.x + 1.0) / image_size.x;
        float xn = pos.x * image_size.x < 1.0                   ? (image_size.x - 1.0) / image_size.x   : (pos.x - 1.0) / image_size.x;
        float yp = pos.y * image_size.y > image_size.y - 2.0    ?                  0.0 / image_size.y   : (pos.y + 1.0) / image_size.y;
        float yn = pos.y * image_size.y < 1.0                   ? (image_size.y - 1.0) / image_size.y   : (pos.y - 1.0) / image_size.y;

        // streaming step, fluid distribution propagate
        ff[0] = texture(state_texture3, pos).x;

//         ff[1] = texture(state_texture1, pos - e[1] / image_size).r;
//         ff[2] = texture(state_texture1, pos - e[2] / image_size).g;
//         ff[3] = texture(state_texture1, pos - e[3] / image_size).b;
//         ff[4] = texture(state_texture1, pos - e[4] / image_size).a;
//
//         ff[5] = texture(state_texture2, pos - e[5] / image_size).r;
//         ff[6] = texture(state_texture2, pos - e[6] / image_size).g;
//         ff[7] = texture(state_texture2, pos - e[7] / image_size).b;
//         ff[8] = texture(state_texture2, pos - e[8] / image_size).a;

        ff[1] = texture(state_texture1, vec2(xn, pos.y) + 0.5 / image_size).x;
        ff[2] = texture(state_texture1, vec2(pos.x, yn) + 0.5 / image_size).y;
        ff[3] = texture(state_texture1, vec2(xp, pos.y) + 0.5 / image_size).z;
        ff[4] = texture(state_texture1, vec2(pos.x, yp) + 0.5 / image_size).w;
        ff[5] = texture(state_texture2, vec2(xn, yn) + 0.5/image_size).x;
        ff[6] = texture(state_texture2, vec2(xp, yn) + 0.5/image_size).y;
        ff[7] = texture(state_texture2, vec2(xp, yp) + 0.5/image_size).z;
        ff[8] = texture(state_texture2, vec2(xn, yp) + 0.5/image_size).w;

        // collision step
        // macroscopic density
        rho = 0.0;
        for (int i = 0; i < 9; i++){
            rho += ff[i];
        }

//        rho = ff[0] + ff[1] + ff[2] + ff[3] + ff[4] + ff[5] + ff[6] + ff[7] + ff[8];
//        u.x = 1.0 / rho * (ff[1] - ff[3] + ff[5] - ff[6] - ff[7] + ff[8]);
//        u.y = 1.0 / rho * (ff[2] - ff[4] + ff[5] + ff[6] - ff[7] - ff[8]);
//         for test mouse input only
//        float dist = (pos.x - mousePos.x) * (pos.x - mousePos.x) + (pos.y - mousePos.y) * (pos.y - mousePos.y);
//        if (dist < 0.0001){
//            rho += 0.5;
//        }

        // macroscopic velocity
        for (int i = 0; i < 9; i++){
            u += ff[i] * e[i];
        }
        
        u = u / rho;
        
        
        float dist = distance(pos, mousePos);
        vec2 radiusVec = vec2(20, 20) / image_size;
        if (dist <= length(radiusVec) ){
            rho = 1.0;
            u = vec2(0.0, 0.0);
        }
        
        
        float feq; // equilibrium density distribution
        float uu_dot = dot(u, u);
        for (int i = 0; i < 9; i++){
            float eu_dot = dot(e[i], u);
            feq = w[i] * rho * (1.0f + 3.0f * eu_dot + 4.5f * eu_dot * eu_dot - 1.5f * uu_dot);
            ff[i] = ff[i] + (feq - ff[i]) / tau; // update fluid distribution
        }
        
          FragColor[0] = vec4( ff[1], ff[2], ff[3], ff[4] );
          FragColor[1] = vec4( ff[5], ff[6], ff[7], ff[8] );
          FragColor[2] = vec4( ff[0], rho, u.x, u.y );
//    }
    /*
    else
    {    //    Node is 'Solid'
        //    To do: Handle the boundary condition here
        float rho, ux, uy;
        float ff[9];// = {0.0};
        if ((pos.x * image_size.x < 2.0) || (pos.x * image_size.x > image_size.x - 3.0) || (pos.y * image_size.y < 2.0) || (pos.y * image_size.y > image_size.y - 3.0))
        { // domain boundaries
            ff[1] = texture(state_texture1, pos).x;
            ff[2] = texture(state_texture1, pos).y;
            ff[3] = texture(state_texture1, pos).z;
            ff[4] = texture(state_texture1, pos).w;
            
            ff[5] = texture(state_texture2, pos).x;
            ff[6] = texture(state_texture2, pos).y;
            ff[7] = texture(state_texture2, pos).z;
            ff[8] = texture(state_texture2, pos).w;
        }
        else{ // obstacle boundaries
            float xp = pos.x * image_size.x > image_size.x - 4.0    ?                    2./ image_size.x   : (pos.x + 1.0) / image_size.x;
            float xn = pos.x * image_size.x < 3.0                   ? (image_size.x - 3.0) / image_size.x   : (pos.x - 1.0) / image_size.x;
            float yp = pos.y * image_size.y > image_size.y - 4.0    ?                  2.0 / image_size.y   : (pos.y + 1.0) / image_size.y;
            float yn = pos.y * image_size.y < 3.0                   ? (image_size.y - 3.0) / image_size.y   : (pos.y - 1.0) / image_size.y;
            // ff[1] = texture(state_texture1, pos - e[1] / image_size).x;
            // ff[2] = texture(state_texture1, pos - e[2] / image_size).y;
            // ff[3] = texture(state_texture1, pos - e[3] / image_size).z;
            // ff[4] = texture(state_texture1, pos - e[4] / image_size).w;

            // ff[5] = texture(state_texture2, pos - e[5] / image_size).x;
            // ff[6] = texture(state_texture2, pos - e[6] / image_size).y;
            // ff[7] = texture(state_texture2, pos - e[7] / image_size).z;
            // ff[8] = texture(state_texture2, pos - e[8] / image_size).w;
            ff[1] = texture(state_texture1, vec2(xn, pos.y)).x;
            ff[2] = texture(state_texture1, vec2(pos.x, yn)).y;
            ff[3] = texture(state_texture1, vec2(xp, pos.y)).z;
            ff[4] = texture(state_texture1, vec2(pos.x, yp)).w;

            ff[5] = texture(state_texture2, vec2(xn, yn)).x;
            ff[6] = texture(state_texture2, vec2(xp, yn)).y;
            ff[7] = texture(state_texture2, vec2(xp, yp)).z;
            ff[8] = texture(state_texture2, vec2(xn, yp)).w;
        }

        ff[0] = texture(state_texture3, pos).x;
        rho = texture(state_texture3, pos).y;
        ux = texture(state_texture3, pos).z;
        uy = texture(state_texture3, pos).w;

        //    Following are DUMMY code only
        // exchange density distribution
        FragColor[0] = vec4( ff[3], ff[4], ff[1], ff[2]);
        FragColor[1] = vec4( ff[7], ff[8], ff[5], ff[6] );
        FragColor[2] = vec4( ff[0], rho, ux, uy );
    }
     */
}
