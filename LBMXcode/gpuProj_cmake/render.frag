#version 330 core
in vec2 texCoord;
out vec4 FragColor;
uniform sampler2D boundary_texture;    //boundary texture map specifying boundaries
uniform sampler2D state_texture3;        //input texture containing f0, rho, ux and uy
uniform sampler2D state_texture1;        //input texture containing f1-f4
uniform sampler2D state_texture2;        //input texture containing f5-f8
uniform vec2 image_size;
uniform float time;


vec4 computeColor(float normal_value)
{
    vec3 color;
//    if(normal_value<0.0) normal_value = 0.0;
//    if(normal_value>1.0) normal_value = 1.0;
    float v1 = 1.0/7.0;
    float v2 = 2.0/7.0;
    float v3 = 3.0/7.0;
    float v4 = 4.0/7.0;
    float v5 = 5.0/7.0;
    float v6 = 6.0/7.0;
    //compute color
    if(normal_value<v1)
    {
      float c = normal_value/v1;
      color.x = 70.*(1.-c);
      color.y = 70.*(1.-c);
      color.z = 219.*(1.-c) + 91.*c;
    }
    else if(normal_value<v2)
    {
      float c = (normal_value-v1)/(v2-v1);
      color.x = 0.;
      color.y = 255.*c;
      color.z = 91.*(1.-c) + 255.*c;
    }
    else if(normal_value<v3)
    {
      float c = (normal_value-v2)/(v3-v2);
      color.x =  0.*c;
      color.y = 255.*(1.-c) + 128.*c;
      color.z = 255.*(1.-c) + 0.*c;
    }
    else if(normal_value<v4)
    {
      float c = (normal_value-v3)/(v4-v3);
      color.x = 255.*c;
      color.y = 128.*(1.-c) + 255.*c;
      color.z = 0.;
    }
    else if(normal_value<v5)
    {
      float c = (normal_value-v4)/(v5-v4);
      color.x = 255.*(1.-c) + 255.*c;
      color.y = 255.*(1.-c) + 96.*c;
      color.z = 0.;
    }
    else if(normal_value<v6)
    {
      float c = (normal_value-v5)/(v6-v5);
      color.x = 255.*(1.-c) + 107.*c;
      color.y = 96.*(1.-c);
      color.z = 0.;
    }
    else
    {
      float c = (normal_value-v6)/(1.-v6);
      color.x = 107.*(1.-c) + 223.*c;
      color.y = 77.*c;
      color.z = 77.*c;
    }
    return vec4(color.r/255.0,color.g/255.0,color.b/255.0,1.0);
}

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
    //    TO DO: More sophisticated display output

    vec2 pos = texCoord.xy;        //    Position of each lattice node
    if ((pos.x * image_size.x < 2.0f) || (pos.x * image_size.x > image_size.x - 3.0f) || (pos.y * image_size.y < 2.0f) || (pos.y * image_size.y > image_size.y - 3.0f))
    {    // fix domain boundaries
        FragColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);
    }
    else
    {
        vec4 boundaryColor = getBoundaryColor();
        if (boundaryColor.r > 0.5)
        {
            // fluid
            float color = texture( state_texture3, pos).y; // rho
    //        float ux = texture(state_texture3, pos).z;
    //        float uy = texture(state_texture3, pos).w;
    //        float u = sqrt(ux * ux + uy * uy);
    //        FragColor = computeColor(u);
    //        if (color > 1.2f){
    //            FragColor = vec4(0.0f, 0.0f, 1.0f, 0.0f);
    //        }else{
    //            FragColor = vec4( color*0.4, color*0.6, color, 0.0 );
    //        }
            FragColor = vec4( color*0.4, color*0.6, color, 0.0 );
        }
        else
        {   // obstacle boundaries
            FragColor = boundaryColor;
        }
    }
    
}
