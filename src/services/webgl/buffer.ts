
export type BufferObjectOption = {
    gl:WebGL2RenderingContext, 
    vboData: ArrayBufferView, 
    eboData: ArrayBufferView,
}

export interface BufferObject {
    dispose:()=>void,
    bind:()=>void,
    unbind:()=>void,
    byteLength: number,
}

export function createWebgl2BufferObject({gl,vboData,eboData}:BufferObjectOption):BufferObject{


    const vbo = gl.createBuffer()

    const elementArrayBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elementArrayBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, eboData, gl.STATIC_DRAW)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, vboData, gl.STATIC_DRAW)

    unbind()

    function unbind(){
        gl.bindBuffer(gl.ARRAY_BUFFER,null)
        gl.bindVertexArray(null)
    }

    return {
        dispose(){
            gl.deleteBuffer(vbo)
        },
        bind(){
            gl.bindBuffer(gl.ARRAY_BUFFER,vbo)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elementArrayBuffer)
        },
        unbind,
        byteLength:eboData.byteLength
    }
}