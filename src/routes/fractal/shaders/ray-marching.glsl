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
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

// 一种比较非主流的绘图方式
// 使用ray marching 来画场景. 
// 也就是对每一个像素, 追溯这一点上照到摄像头的光, 计算其从什么表面而来
// ray marching 和 ray tracing 有什么区别呢?
// 我也不是很了解.

const int maxIteration = 500;    
const float limit = 2.0;
const float PI = 3.1415926;

#include <noise>;
#include <fbm>;



// 假设有个方向光, 方向为 -1, -1, 1
vec3 directionalLight(vec3 normal){
    float strength = 1.0;
    vec3 color = vec3(1.0, 1.0, 1.0);
    vec3 direction = normalize(vec3(-1.0, -1.0, 1.0));
    return dot(direction, normal) * color;
}

vec3 calculateLighting(vec3 normal){
    return directionalLight(normal);
}

vec4 crossSphere(vec3 rayOrigin, vec3 rayDirection, vec3 origin, float radius, out vec3 reflectPoint, out vec3 reflectDirection){

    float b_times_cos_theta = dot( origin - rayOrigin, rayDirection );

    vec3 d = origin - rayOrigin - b_times_cos_theta * rayDirection;

    float dist = length(d);

    if(dist > radius){
        reflectPoint = rayOrigin;
        reflectDirection = rayDirection;
        return vec4(0,0,0,0.0); //just air
    }else{
        // float l = sqrt(radius * radius - dist * dist);
        // vec3 normal = normalize(d - rayDirection * l);
        // return vec4(calculateLighting(normal), 1.0);
        return vec4(1.0,1.0,1.0,1.0);
    }
}

// vec4 plane(vec3 rayOrigin, vec3 rayDirection, vec3 origin, vec3 up, float w, float h){

// }


void main(){
    vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;
    
    //horizontal fov, 45deg

    //假设有个球在原点, 半径为10, //有个平面在 0,0,-10, 宽度为30. 先不考虑这个平面
    //摄像机在 50, 50, 50, 看着 -1,-1,-1,也就是看着原点
    //                           -
    //                       -   |
    //                   -       |
    //               -   |       |
    //           -       |       |
    // origin - )fov     |       | 
    //           -       |       |
    //               -   |       |
    //                   -       |
    //                 near  -   |
    //                   ↑       -
    //                   ↑      far
    //        ____________(1,1)   
    //       |              |
    //       |              |
    //       |              | h
    //       |              |
    //     (-1,-1)----------
    //              w
    //      w:h = 16:9
    //
    //
    //       tan(fov/2.0)
    //       |-------/
    //       |      /  
    //       |     /
    //       |    /
    //       |   /
    //       |  /
    //       | /
    //      origin
    //
    //

    float fov = PI / 4.0;
    float ratio = 9.0 / 16.0;
    float near = 1.0;
    float far = 100.0;
    //这里其实可以把相机的旋转用四元数表示
    vec3 cameraOrigin = vec3(50.0,50.0,50.0);
    vec3 cameraUp = normalize(vec3(-1.0,-1.0,1.0));
    vec3 cameraDirection = normalize(vec3(-1.0,-1.0,-1.0));
    vec3 cameraRight = cross(cameraUp, cameraDirection);

    float tan_fov_over_2 = tan(fov/2.0);

    vec3 ray = normalize(
        cameraDirection + cameraRight * tan_fov_over_2 * point.x + cameraUp * tan_fov_over_2 * ratio * point.y
    );

    vec3 reflectPoint;
    vec3 outRay;

    // if(length(ray + normalize(vec3(1.0,1.0,1.0))) < 0.000002){
    //     color = vec4(1.0,1.0,1.0,1.0);
    // }else{
    //     color = vec4(0.0,0.0,0.0,0.0);
    // }
    // color = vec4(abs(ray),1.0);
    color = vec4(1.0/sqrt(3.0),1.0/sqrt(3.0),1.0/sqrt(3.0),1.0);

    // color = crossSphere(
    //     cameraOrigin,
    //     ray,
    //     vec3(0.0,0.0,0.0),
    //     0.001,
    //     reflectPoint,
    //     outRay
    // );
}