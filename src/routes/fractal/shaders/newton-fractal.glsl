#version 300 es
precision highp float;

// 所谓的牛顿分形, 就是用牛顿法计算某方程式的解的时候, 
// 如果把屏幕上的每个点按照它们最后会收敛到方程式的第几个根来着色的话,
// 会形成的一种分形, 以下是 z^3 - 1.0 的牛顿分形,
// 把鼠标接近 1.0,0.0 可以看到效果
// 所谓牛顿法
// 就是循环计算z = z - fn(z) / fnPrime(z),直到z足够接近fn的根.

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

const float epsilon = 0.01;

 
const float PI = 3.1415916;

#include <hsl2rgb>;
#include <complex>;


vec2 fn(vec2 z){
    //修改这行来查看不同的图案!!!❤️
    return complexPow(z, 3.0) - vec2(1.0,0.0) - time / 1000.0;
}

const vec2 deltaZ = vec2(epsilon,epsilon);

vec2 fnPrime(vec2 z){
    return complexDiv( fn(z + deltaZ) - fn(z), deltaZ );
}

vec3 newtonFractal(vec2 z, vec2 c){
    float l = 0.0;
    float loop = 0.0;
    int maxIteration = 150;
    for(int i=0; i<maxIteration; i++){
        // newton's fractal for z^3 - 1
        z = z - complexDiv( fn(z),  fnPrime(z) );
        loop += 1.0;
        if(length(fn(z)) < epsilon){
            return vec3(z.xy,z.y/z.x);
        }
        // if(distance(root1, z) < epsilon){
        //     return vec3(0.5,1.0,1.0);
        // }
        // if(distance(root2, z) < epsilon){
        //     return vec3(1.0,0.5,1.0);
        // }
        // if(distance(root3, z) < epsilon){
        //     return vec3(1.0,1.0,0.5);
        // }
    }
    return vec3(1.0,1.0,1.0);
}

void main(){
    vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;
    vec3 res = newtonFractal(point,mouse);
    color = vec4(res.xyz, 1.0);
}