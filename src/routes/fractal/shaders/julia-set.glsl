#version 300 es
precision highp float;
uniform vec2 resolution;
in vec3 vPos;
in vec2 vUv;
out vec4 color;
uniform vec2 translate;
uniform float zoom;

//参数z控制循环次数
uniform vec3 params;
uniform float time;
uniform vec2 mouse;
 
const float limit = 2.0;

#include <hsl2rgb>;
#include <complex>;

vec3 juliaSet(vec2 z, vec2 c){
    float l = 0.0;
    float loop = 0.0;
    int maxIteration = int(params.z) + 50;
    for(int i=0; i<maxIteration; i++){
        //修改这行可以查看不同的图案!!!❤️
        z = complexPow(z, 2.0) + c;
        l = length(z);
        loop += 1.0;
        if(l > limit){
            break;
        }
    }
    float x = log( log(l) / log(2.0) / loop ) / log(1024.0);
    return hsl2rgb(vec3( x , ( step(l,limit) + step(l,limit * 2.0) ) / 2.0, 1.0 ));

    // return colorMapping(l, loop, float(maxIteration));
}

void main(){
    vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;

    // vec2 c = vec2(cos(time / 2000.0),sin(time / 2000.0));
    //vec2 c = vec2(x,y);

    // vec2 c = vec2(cos(params.y),sin(params.y));

    vec3 res = juliaSet(point,mouse);
    color = vec4(res.xyz, 1.0);
}