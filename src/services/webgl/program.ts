import {BufferObject} from "./buffer"

type GLSizeOrData = number | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array |
Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer | null

const _gl:WebGL2RenderingContext = document.createElement('canvas').getContext("webgl2") as any

type ProgramOptions<Attributes extends string, Uniforms extends string> = {
    gl:WebGL2RenderingContext,
    vsSource:string,
    fsSource:string,
    attributes:Record<Attributes,AttributeDefinition>
    uniforms:Record<Uniforms,number|number[]|Float32Array>,
}

const shaderChunks = {
    fbm: require("./shader-chunks/fbm.glsl").default,
    hsl2rgb: require("./shader-chunks/hsl2rgb.glsl").default,
    noise: require("./shader-chunks/noise.glsl").default,
    complex: require("./shader-chunks/complex.glsl").default,
}

function shaderPreprocessor(source:string){
    return source.replace(/\#include\s+\<([a-z0-9A-Z_]+)\>;?/g, (_, name)=>{
        return shaderChunks[name] || ""
    })
}

function createShaderError(source:string, errLog:string){
    const matches = errLog.match(/^ERROR\: (\d+)\:(\d+)\:/)
    if(matches){
        const splitedSource = source.split(/\n/g)
        const errPos = Number(matches[2])
        console.log(errPos, splitedSource.slice(errPos-1, errPos+1).join("\n"))
    }
    return new Error(errLog)
}

export function createWebgl2Program<Attributes extends string, Uniforms extends string>(options:ProgramOptions<Attributes,Uniforms>){

    const {
        gl,
        vsSource,
        fsSource,
        attributes,
        uniforms,
    } = options

    const program = gl.createProgram()

    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs,shaderPreprocessor(vsSource))

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs,shaderPreprocessor(fsSource))

    gl.compileShader(vs)
    gl.compileShader(fs)

    {
        gl.attachShader(program,vs)
        const errLog = gl.getShaderInfoLog(vs)
        gl.deleteShader(vs)
        if(errLog){
            throw createShaderError(vsSource, errLog)
        }
    }

    {
        gl.attachShader(program,fs)
        const errLog = gl.getShaderInfoLog(fs)
        gl.deleteShader(fs)
        if(errLog){
            throw createShaderError(fsSource, errLog)
        }
    }

    gl.linkProgram(program)
    
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const lastError = gl.getProgramInfoLog(program);
        throw new Error(lastError);

    }

    gl.useProgram(program)
    
    const vao = gl.createVertexArray()

    // gl.enable(gl.SAMPLE_COVERAGE);
    // gl.sampleCoverage(1, false);

    // console.log(gl.getError())

    // const attrs:Map<string,AttributeDefinition> = new Map()
    // function addAttribute(name:string,type:AttrType,size:1|2|3|4,stride:number,offset:number){
    //     const location = gl.getAttribLocation(this.program,name)
    //     attrs.set(name,{
    //         location,
    //         type,
    //         size,
    //         stride,
    //         offset,
    //     })
    // }

    const setUniformByValue = makeUniformSetter(program)

    for(let name in uniforms){
        const value = uniforms[name]
        setUniformByValue(gl,name,value)
    }

    function init(){

        //init draw
        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.BLEND)
        gl.enable(gl.CULL_FACE)
        gl.enable(gl.DEPTH_TEST)
        gl.cullFace(gl.BACK)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        //init vao
        gl.bindVertexArray(vao)
        for(let name in attributes){
            const attr = attributes[name]
            attr.location = attr.location || gl.getAttribLocation(program, name)
            gl.enableVertexAttribArray(attr.location)
            gl.vertexAttribPointer(attr.location,attr.size,attr.type,false,attr.stride,attr.offset)
        }
    }

    function draw(mode:DrawMode, bufferObject: BufferObject){
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawElements(mode,bufferObject.byteLength,gl.UNSIGNED_BYTE,0)
    }
        
    return {
        program,
        draw,
        bind(){
            gl.useProgram(program)
            gl.bindVertexArray(vao)
        },
        unbind(){
            gl.bindVertexArray(null)
        },
        init,
        uniforms: new Proxy(uniforms, {
            set(_target, key: Uniforms, value: number|number[]){
                setUniformByValue(gl,key,value)
                return true
            }
        }),
        dispose(){
            gl.deleteProgram(program)
            gl.deleteVertexArray(vao)
        }
    }
}

export enum DrawMode {
    lines = _gl.LINES,
    line_strip = _gl.LINE_STRIP,
    line_loop = _gl.LINE_LOOP,
    triangle = _gl.TRIANGLES,
    triangle_strip = _gl.TRIANGLE_STRIP,
    triangle_fan = _gl.TRIANGLE_FAN,
}

// export enum UniformType {
//     uniform1ui="uniform1ui",
//     uniform2ui="uniform2ui",
//     uniform3ui="uniform3ui",
//     uniform4ui="uniform4ui",
//     uniform1uiv="uniform1uiv",
//     uniform2uiv="uniform2uiv",
//     uniform3uiv="uniform3uiv",
//     uniform4uiv="uniform4uiv",
//     uniformMatrix2x3fv="uniformMatrix2x3fv",
//     uniformMatrix3x2fv="uniformMatrix3x2fv",
//     uniformMatrix2x4fv="uniformMatrix2x4fv",
//     uniformMatrix4x2fv="uniformMatrix4x2fv",
//     uniformMatrix3x4fv="uniformMatrix3x4fv",
//     uniformMatrix4x3fv="uniformMatrix4x3fv",
//     uniformBlockBinding="uniformBlockBinding",
//     uniform1f="uniform1f",
//     uniform1fv="uniform1fv",
//     uniform1i="uniform1i",
//     uniform1iv="uniform1iv",
//     uniform2f="uniform2f",
//     uniform2fv="uniform2fv",
//     uniform2i="uniform2i",
//     uniform2iv="uniform2iv",
//     uniform3f="uniform3f",
//     uniform3fv="uniform3fv",
//     uniform3i="uniform3i",
//     uniform3iv="uniform3iv",
//     uniform4f="uniform4f",
//     uniform4fv="uniform4fv",
//     uniform4i="uniform4i",
//     uniform4iv="uniform4iv",
//     uniformMatrix2fv="uniformMatrix2fv",
//     uniformMatrix3fv="uniformMatrix3fv",
//     uniformMatrix4fv="uniformMatrix4fv",
// }

export enum AttrType {
    byte = _gl.BYTE,
    short = _gl.SHORT,
    unsigned_byte = _gl.UNSIGNED_BYTE,
    unsigned_short = _gl.UNSIGNED_SHORT,
    float = _gl.FLOAT,
    half_float = _gl.HALF_FLOAT,
}

type AttributeDefinition = {
    location?:number, //location in vao, 0~gl.MAX_ATTRIBUTE
    type:AttrType,
    size:1|2|3|4,
    stride:number,
    offset:number,
}

function makeUniformSetter(program:WebGLProgram){
    const setters = new Map<WebGLUniformLocation,Function>()
    return function setUniformByValue(gl:WebGL2RenderingContext, key:string, value:number|number[]|Float32Array){
        if(!setters.has(key)){
            const loc = gl.getUniformLocation(program,key)
            let setter = guessType(gl, loc, value)
            setters.set(key, setter)
        }
        const setter = setters.get(key)
        setter(value)
    }
}

function guessType(gl:WebGL2RenderingContext, loc:WebGLUniformLocation,value:number|number[]|Float32Array){
    if(Array.isArray(value) || value instanceof Float32Array){
        switch(value.length){
            case 4:{
                return value=>gl.uniform4fv(loc,value)
            }
            case 3:{
                return value=>gl.uniform3fv(loc,value)
            }
            case 2:{
                return value=>gl.uniform2fv(loc,value)
            }
            case 16:{
                return value=>gl.uniformMatrix4fv(loc,true,value)
            }
            case 9:{
                return value=>gl.uniformMatrix3fv(loc,true,value)
            }
            default:{
                return value=>gl.uniform1fv(loc,value)
            }
        }
    }else{
        return value=>gl.uniform1f(loc,value)
    }
}