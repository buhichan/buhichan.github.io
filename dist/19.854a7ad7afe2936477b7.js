(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{"./src/routes/fractal/shaders/julia-and-man.glsl":function(n,o,t){"use strict";t.r(o),o.default="#version 300 es\nprecision highp float;\nuniform vec2 resolution;\nin vec3 vPos;\nin vec2 vUv;\nout vec4 color;\nuniform vec2 translate;\nuniform float zoom;\n\n//参数z控制循环次数\nuniform vec3 params;\nuniform float time;\nuniform vec2 mouse;\n \nconst float limit = 2.0;\n\n#include <hsl2rgb>;\n\n\n\nvec3 colorMapping(in float c, in float loop, in float maxIteration){\n\n    return mix(\n        step(21.0, loop) * vec3(\n            cos(c / 2.0),\n            cos(c / (params.x + 22.5)),\n            cos(c / (params.y + 31.0))\n        ),\n        vec3(1.0,1.0,1.0),\n        loop / maxIteration\n    );\n}\n\nvec3 mandelbrotSet(vec2 c){\n    float max_iter = params.z + 150.0;\n\n    int _maxIter = int(max_iter);\n    vec2 z = c;\n    float l = 0.0;\n    float loop = 0.0;\n    float h = 0.0;\n    for(int i=0; i<_maxIter; i++){\n        z = vec2(z.x * z.x - z.y * z.y , z.x * z.y * 2.0) + c;\n        l = length(z);\n        loop += 1.0;\n        if(l > limit){\n            break;\n        }\n    }\n\n    // h = loop / float(maxIteration);\n\n    return colorMapping( log( l / pow(2.0, loop)), loop, max_iter );\n}\n\nvec3 juliaSet(vec2 z, vec2 c){\n    float l = 0.0;\n    float loop = 0.0;\n    int maxIteration = int(params.z) + 50;\n    for(int i=0; i<maxIteration; i++){\n        z = vec2(z.x * z.x - z.y * z.y , - z.x * z.y * 2.0) + c;\n        l = length(z);\n        loop += 1.0;\n        if(l > limit){\n            break;\n        }\n    }\n    float x = log( log(l) / log(2.0) / loop ) / log(1024.0);\n    return hsl2rgb(vec3( x , ( step(l,limit) + step(l,limit * 2.0) ) / 2.0, 1.0 ));\n\n    // return colorMapping(l, loop, float(maxIteration));\n}\n\nvoid main(){\n    vec2 point = ( vUv.xy + translate / resolution ) * zoom * 2.0 - 1.0;\n\n    // vec2 c = vec2(cos(time / 2000.0),sin(time / 2000.0));\n    //vec2 c = vec2(x,y);\n\n    // vec2 c = vec2(cos(params.y),sin(params.y));\n\n    vec3 res = mix(\n        juliaSet(point,mouse),\n        mandelbrotSet(point),\n        .5\n    );\n    color = vec4(res.xyz, 1.0);\n}"}}]);