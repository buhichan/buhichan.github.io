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
// uniform mat4 modelMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 projectionMatrix;

// 使用ray tracing 来画场景. 
// 也就是对每一个像素, 追溯这一点上照到摄像头的光, 计算其从什么表面而来

const int maxIteration = 500;    
const float limit = 2.0;
const float PI = 3.1415926;

#include <noise>;
#include <fbm>;


vec3 lightSource(vec3 normal, vec3 reflectPoint, vec3 reflectDirection, vec3 lightColor, vec3 lightPosition){
    float diffuseFactor = .52;
    float specularFactor = .6 + params.z / 10.0;
    float shininess = 50.0;
    vec3 direction = normalize( lightPosition - reflectPoint );
    vec3 diffuse = diffuseFactor * clamp(dot(direction, normal), 0.0, 1.0) * lightColor;
    vec3 specular = specularFactor * pow( clamp( dot(direction, reflectDirection), 0.0, 1.0), shininess) * lightColor;
    return diffuse + specular;
}

vec3 phongModel(vec3 materialColor, vec3 normal, vec3 reflectPoint, vec3 reflectDirection){
    // https://en.wikipedia.org/wiki/Phong_reflection_model
    float ambientReflection = .2;
    vec3 ambientLight = ambientReflection * materialColor;
    return ambientLight + lightSource(
        normal, 
        reflectPoint, 
        reflectDirection, 
        vec3(1.0,1.0,1.0), 
        vec3(.0,10.0,20.0)
    ) + lightSource(
        normal, 
        reflectPoint, 
        reflectDirection, 
        vec3(1.0,1.0,1.0), 
        vec3(.0,-50.0,-20.0)
    );
}

// sphere DE
// float distanceEstimator(vec3 point){
//     vec3 center = vec3(0.0,0.0,0.0);
//     float dist = length(point - center);
//     float radius = 10.0;
//     float theta =  atan(point.x, point.y);
//     float phi = atan(point.z, length(point.xy));
//     return dist - radius;
// }

// cube DE
// float distanceEstimator(vec3 point){
//     float radius = 5.0;
//     // return ;
//     vec3 dist = max(abs(point) - radius, 0.0);
//     return length(dist);
// }

// cylinder DE
float distanceEstimator(vec3 point){
    float d1 = max(0.0, length(point.xy) - 5.0);
    float d2 = max(0.0, abs(point.z) - 5.0);
    return length(vec2(d1,d2));
}


const int MAX_LOOP = 150;
const float EPSILON = 0.001;
const float FAR = 50.0;
vec4 rayTracingUsingDistanceEstimator(vec3 rayOrigin, vec3 rayDirection, out vec3 reflectPoint, out vec3 reflectDirection){
    vec3 curPoint = rayOrigin;
    for(int i = 0; i < MAX_LOOP; i++){
        float curDist = distanceEstimator(curPoint);
        if(curDist < EPSILON){
            //use gradient of distanceEstimator as normal
            vec3 normal = normalize( vec3(
                (distanceEstimator( curPoint + vec3(EPSILON,0.0,0.0) ) - distanceEstimator( curPoint - vec3(EPSILON,0.0,0.0) )),
                (distanceEstimator( curPoint + vec3(0.0,EPSILON,0.0) ) - distanceEstimator( curPoint - vec3(0.0,EPSILON,0.0) )),
                (distanceEstimator( curPoint + vec3(0.0,0.0,EPSILON) ) - distanceEstimator( curPoint - vec3(0.0,0.0,EPSILON) ))                
            ) );
            reflectPoint = curPoint;
            reflectDirection = normalize(2.0 * dot(rayOrigin - reflectPoint, normal) * normal - (rayOrigin - reflectPoint));
            vec3 materialColor = sign(normal);
            // vec3 materialColor = vec3(0.0,0.0,0.0);
            return vec4(
                phongModel(
                    materialColor,
                    normal,
                    reflectPoint,
                    reflectDirection
                ),
                1.0
            );
        }else if(curDist > FAR){
            break;
        }else{
            curPoint = curPoint + 0.5 * rayDirection * curDist;
        }
    }
    return vec4(0.0,0.0,0.0,0.0);
}


void main(){
    // vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;
    vec2 point = vUv.xy * 2.0 - 1.0;
    
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
    float ratio = 1.0;
    float near = 1.0;
    float far = 100.0;
    //相机的位置用极坐标表示.
    //这里其实可以把相机的旋转用四元数表示
    //matQuaternionRot [0][0] = ux*ux*oneC + cosA;
    // matQuaternionRot [0][1] = ux*uy*oneC - uz*sinA;
    // matQuaternionRot [0][2] = ux*uz*oneC + uy*sinA;
    // matQuaternionRot [1][0] = uy*ux*oneC + uz*sinA;
    // matQuaternionRot [1][1] = uy*uy*oneC + cosA;
    // matQuaternionRot [1][2] = uy*uz*oneC - ux*sinA;
    // matQuaternionRot [2][0] = uz*ux*oneC - uy*sinA;
    // matQuaternionRot [2][1] = uz*uy*oneC + ux*sinA;
    // matQuaternionRot [2][2] = uz*uz*oneC + cosA;

    float theta = translate.x / 100.0;
    float phi = translate.y / 100.0;

    vec3 cameraOrigin = 50.0 * zoom * vec3(
        cos(theta) * cos(phi),
        sin(theta) * cos(phi),
        sin(phi)
    );
    //看向原点
    vec3 cameraDirection = normalize(-1.0 * cameraOrigin);
    
    vec3 cameraRight = vec3(
        -sin(theta),
        cos(theta),
        0.0
    );

    vec3 cameraUp = normalize(cross(cameraRight,cameraDirection));

    float tan_fov_over_2 = tan(fov/2.0);

    vec3 ray = normalize(
        cameraDirection + cameraRight * tan_fov_over_2 * point.x + cameraUp * tan_fov_over_2 * ratio * point.y
    );

    vec3 reflectPoint;
    vec3 outRay;

    color = rayTracingUsingDistanceEstimator(
        cameraOrigin,
        ray,
        reflectPoint,
        outRay
    );
}

// vec4 crossSphere(vec3 rayOrigin, vec3 rayDirection, vec3 center, float radius, out vec3 reflectPoint, out vec3 reflectDirection){

//     float b_times_cos_theta = dot( center - rayOrigin, rayDirection );
//     //
//     //       rayDirection  center  
//     //             |---d-->/
//     //             |      /  
//     // reflectPoint-     /
//     //             |    /
//     //             |   /
//     //             |  /
//     //             | /
//     //          rayOrigin

//     vec3 d = center - rayOrigin - b_times_cos_theta * rayDirection;

//     float dist = length(d);

//     if(dist > radius){
//         reflectPoint = rayOrigin;
//         reflectDirection = rayDirection;
//         return vec4(0,0,0,0.0); //air
//     }else{
//         float l = sqrt(radius * radius - dist * dist);
//         vec3 normal = - normalize(d + rayDirection * l);
//         reflectPoint = center + radius * normal;
//         reflectDirection = normalize(2.0 * dot(rayOrigin - reflectPoint, normal) * normal - (rayOrigin - reflectPoint));
//         vec3 materialColor = sign(normal);
//         return vec4(phongModel(materialColor, normal, reflectPoint, reflectDirection), 1.0);
//     }
// }