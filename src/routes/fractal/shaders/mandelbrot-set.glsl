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

const float limit = 2.0;



vec3 colorMapping(in float c, in float loop, in float maxIteration){

    return mix(
        step(21.0, loop) * vec3(
            cos(c / 2.0),
            cos(c / (params.x + 22.5)),
            cos(c / (params.y + 31.0))
        ),
        vec3(1.0,1.0,1.0),
        loop / maxIteration
    );
}

vec3 mandelbrotSet(vec2 c){
    float max_iter = params.z + 150.0;

    int _maxIter = int(max_iter);
    vec2 z = c;
    float l = 0.0;
    float loop = 0.0;
    float h = 0.0;
    for(int i=0; i<_maxIter; i++){
        z = vec2(z.x * z.x - z.y * z.y , z.x * z.y * 2.0) + c;
        l = length(z);
        loop += 1.0;
        if(l > limit){
            break;
        }
    }

    // h = loop / float(maxIteration);

    return colorMapping( log( l / pow(2.0, loop)), loop, max_iter );
}

void main(){
    vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;
    color = vec4(1.0 - mandelbrotSet(point), 1.0);
}