#version 300 es
precision highp float;
uniform vec2 resolution;
in vec3 vPos;
in vec2 vUv;
out vec4 color;
uniform vec2 translate;
uniform float zoom;
uniform vec3 params;
uniform float time;


const int maxIteration = 500;    
const float limit = 2.0;
const float PI = 3.1415926;

#include <noise>;
#include <fbm>;

float flame(vec2 v){
    float disturb_x = 0.0;//v.x + fbm(vec2(v.x, v.y - time / 3000.0 )) * .2;
    float disturb_y = 0.0;//v.y + fbm(vec2(v.x, v.y - time / 100.0 )) * 1.2;
    float radius = -pow((v.x + disturb_x) * 5.0, 2.0) - 25.0 - (v.y + disturb_y) * 5.0 + 5.0;
    return radius;
}

void main(){
    vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;
    
    float pov = 45;
 
    vec3 flame_color = vec3(1.0, 1.0, .5);

    // color = vec4(flame_color * lightness, 1.0);

    float c = clamp(0.0,1.0,length(point));
    
    color = vec4( c,c,c, 1.0);
}