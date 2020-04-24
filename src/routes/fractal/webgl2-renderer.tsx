import * as React from "react";
import { createWebgl2Program, AttrType } from "../../services/webgl/program";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
// import * as Hammer from "hammerjs"
import "./webgl2-renderer.css";
import { mat4, vec3 } from "gl-matrix";
import { createWebgl2BufferObject } from "../../services/webgl/buffer";

// import "webgl2"
///<reference path="../../../node_modules/@types/webgl2/index.d.ts" />

type Props = {};

enum ShaderType {
  twod,
  threed,
}
const shaders: [string, ShaderType][] = [
  ["mandelbrot-set" as const, ShaderType.twod],
  ["julia-set" as const, ShaderType.threed],
  ["burning-ship" as const, ShaderType.twod],
  ["julia-and-man" as const, ShaderType.twod],
  ["newton-fractal" as const, ShaderType.twod],
  ["ray-tracing" as const, ShaderType.threed],
];

const vertexShader = `#version 300 es
precision highp float;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
in vec3 position;
in vec2 uv;
out vec3 vPos;
out vec2 vUv;

void main(){
    vPos = position;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const isMobile = window.innerWidth < 1068;

const HEIGHT = isMobile ? window.innerWidth : 720;
const WIDTH = isMobile ? window.innerWidth : 720;

export default function WebglRenderer(props: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>();

  const editorRef = React.useRef<HTMLDivElement>();

  const coordinateDisplayRef = React.useRef<HTMLSpanElement>();

  const [fsName, setShaderName] = React.useState(() => {
    const urlSearch = new URLSearchParams(location.search);
    const urlShader = urlSearch.get("shader");
    return urlShader || shaders[0][0];
  });

  React.useEffect(() => {
    const sub = fromEvent(window, "scroll")
      .pipe(debounceTime(500))
      .subscribe((e) => {
        if (canvasRef.current && window.innerWidth > 768) {
          const canvas = canvasRef.current;
          // const bcr = canvas.getBoundingClientRect()
          canvas.style.top = window.scrollY + "px";
        }
      });
    return () => sub.unsubscribe();
  }, []);

  const [fragmentShader, setShader] = React.useState(null);

  React.useEffect(() => {
    import("./shaders/" + fsName + ".glsl").then((res) => {
      setShader(res.default);
      if (editorRef.current) {
        editorRef.current.innerText = res.default;
      }
    });
  }, [fsName]);

  const state = React.useMemo(
    () => ({
      zoom: 1,
      translate: [0, 0],
      paused: false,
      mouse: [0, 0],
    }),
    []
  );

  const [error, setError] = React.useState(null as null | Error);

  React.useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const subs = [];
    const shaderConfig = shaders.find((x) => x[0] === fsName);
    const shaderType = (shaderConfig && shaderConfig[1]) || ShaderType.twod;

    const onwheel = (e: MouseWheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.ctrlKey) {
        const offsetX = e.offsetX; //* devicePixelRatio
        const offsetY = HEIGHT - e.offsetY; // * devicePixelRatio
        const factor = (100 + e.deltaY) / 100;
        if (shaderType === ShaderType.twod) {
          state.translate[0] =
            (state.translate[0] + offsetX) / factor - offsetX;
          state.translate[1] =
            (state.translate[1] + offsetY) / factor - offsetY;
        }
        state.zoom *= factor;
      } else {
        state.translate[0] += e.deltaX;
        state.translate[1] -= e.deltaY;
      }
    };
    canvas.addEventListener("wheel", onwheel);
    subs.push(() => {
      canvas.removeEventListener("wheel", onwheel);
    });

    const onclick = () => {
      state.paused = !state.paused;
    };
    canvas.addEventListener("click", onclick);
    subs.push(() => {
      canvas.removeEventListener("click", onclick);
    });

    // const hammer = new Hammer(canvas, {
    //     enable:true,
    //     recognizers:[
    //         [Hammer.Pan],
    //         [Hammer.Pinch],
    //     ]
    // })
    // hammer.on("tap",e=>{
    //     state.paused = !state.paused
    // })
    // hammer.on("pinch",e=>{
    //     e.preventDefault()
    //     state.zoom = e.scale
    // })

    const updateMousePosition = (offsetX: number, offsetY: number) => {
      const x =
        ((offsetX + state.translate[0]) / WIDTH) * state.zoom * 2.0 - 1.0;
      const y =
        ((offsetY + state.translate[1]) / HEIGHT) * state.zoom * 2.0 - 1.0;
      state.mouse[0] = x;
      state.mouse[1] = y;
      coordinateDisplayRef &&
        coordinateDisplayRef.current &&
        (coordinateDisplayRef.current.innerHTML = `${x.toLocaleString("zh-CN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })},${y.toLocaleString("zh-CN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}`);
    };

    const onpointermove = (e: PointerEvent) => {
      const offsetX = e.offsetX; // * devicePixelRatio
      const offsetY = HEIGHT - e.offsetY; // * devicePixelRatio
      updateMousePosition(offsetX, offsetY);
    };
    const onpointerenter = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
    };
    const onpointerleave = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
    };
    canvas.addEventListener("pointerenter", onpointerenter);
    canvas.addEventListener("pointerleave", onpointerleave);
    canvas.addEventListener("pointermove", onpointermove);
    subs.push(() => {
      canvas.removeEventListener("pointerenter", onpointerenter);
      canvas.removeEventListener("pointerleave", onpointerleave);
      canvas.removeEventListener("pointermove", onpointermove);
    });

    return () => {
      subs.forEach((x) => x());
    };
  }, [fsName]);

  React.useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!fragmentShader) {
      return undefined;
    }
    if (canvas) {
      const glattr = {
        alpha: true,
        depth: true,
        antialias: true,
        premultipliedAlpha: false,
        devicePixelRatio: window.devicePixelRatio,
      } as WebGLContextAttributes;

      let gl = canvas.getContext("webgl2", glattr) as WebGL2RenderingContext;

      if (!gl) {
        gl = canvas.getContext(
          "experimental-webgl2",
          glattr
        ) as WebGL2RenderingContext;
      }

      // const xSegments = Math.floor(WIDTH / 100)
      // const ySegments = Math.floor(HEIGHT / 100)
      const xSegments = 10;
      const ySegments = 10;

      const vertexNumber = (xSegments + 1) * (ySegments + 1);

      /**
       * @property position vec3  3
       * @property uv vec2  2
       */
      const vboDataStride = 3 + 2;
      const vboData = new Float32Array(vertexNumber * vboDataStride);

      for (let j = 0; j <= ySegments; j++) {
        for (let i = 0; i <= xSegments; i++) {
          let offset = (j * (xSegments + 1) + i) * vboDataStride;
          vboData[offset] = i;
          vboData[offset + 1] = j;
          vboData[offset + 2] = 1;
          vboData[offset + 3] = i / xSegments;
          vboData[offset + 4] = j / ySegments;
        }
      }

      const eboData = makePlaneGeometryEBO(xSegments, ySegments);

      //TODO is Here

      const projectionMatrix = mat4.create();
      mat4.perspective(
        projectionMatrix,
        Math.acos(WIDTH / HEIGHT) / 2,
        WIDTH / HEIGHT,
        0.1,
        1000
      );

      const cameraPosition = vec3.create();
      vec3.normalize(cameraPosition, [50, 50, 50]);
      const cameraUp = vec3.create();
      vec3.normalize(cameraPosition, [-1, -1, 1]);

      const viewMatrix = mat4.create();
      mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], cameraUp);

      const modelMatrix = mat4.create();
      mat4.fromTranslation(modelMatrix, [0, 0, 0]);

      const result = mat4.create();

      mat4.multiply(result, viewMatrix, modelMatrix);
      mat4.multiply(result, projectionMatrix, result);

      console.log(
        `[\n${result.slice(0, 4)}\n${result.slice(4, 8)}\n${result.slice(
          8,
          12
        )}\n${result.slice(12, 16)}\n]`
      );

      setError(null);
      try {
        const bo = createWebgl2BufferObject({
          gl,
          vboData,
          eboData,
        });

        const program = createWebgl2Program({
          gl,
          vsSource: vertexShader,
          fsSource: fragmentShader,
          attributes: {
            position: {
              type: AttrType.float,
              size: 3,
              stride: vboDataStride * Float32Array.BYTES_PER_ELEMENT,
              offset: 0,
            },
            uv: {
              type: AttrType.float,
              size: 2,
              stride: vboDataStride * Float32Array.BYTES_PER_ELEMENT,
              offset: Float32Array.BYTES_PER_ELEMENT * 3,
            },
          },
          uniforms: {
            // projectionMatrix:projectionMatrix,
            // modelMatrix,
            // viewMatrix,
            projectionMatrix: [
              2 / xSegments,
              0,
              0,
              -1,
              0,
              2 / ySegments,
              0,
              -1,
              0,
              0,
              1,
              -0.5,
              0,
              0,
              0,
              1,
            ],
            viewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            resolution: [WIDTH, HEIGHT],
            time: 0,
            params: params,
            zoom: state.zoom,
            translate: state.translate,
            mouse: state.mouse,
          },
        });

        let lastRenderTime = 0;
        let totalPauseTime = 0;

        program.bind();

        bo.bind();

        program.init();

        let isFirstLoop = true;

        function loop(timeValue) {
          program.uniforms.translate = state.translate;
          program.uniforms.zoom = state.zoom;
          program.uniforms.params = params;
          let time = timeValue - totalPauseTime;
          program.uniforms.time = time;
          // program.uniforms.projectionMatrix = projectionMatrix
          if (state.paused) {
            totalPauseTime += timeValue - lastRenderTime;
          } else {
            program.uniforms.mouse = state.mouse;
          }
          lastRenderTime = timeValue;
          program.draw(gl.TRIANGLES, bo);
          if (isFirstLoop) {
            const buf = new Uint8Array(4);
            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
            console.log([...buf]);
            isFirstLoop = false;
          }
          animeHandle = requestAnimationFrame(loop);
        }
        let animeHandle = requestAnimationFrame(loop);
        return () => {
          cancelAnimationFrame(animeHandle);
          program.dispose();
          bo.dispose();
        };
      } catch (e) {
        setError(e);
      }
    }
  }, [fragmentShader]);

  const params = React.useMemo(() => [1, 0, 0], []);

  const [magicNumberState, setMagicNumberState] = React.useState(params);

  return (
    <>
      <div id="canvas-left">
        <p>
          一些看似复杂其实跟Hello World一样简单的东西, 没有用框架,
          纯粹是为了学习webgl的API做的轮子.
          编辑下面文本框中的代码可以直接更新图像.
        </p>
        <div
          onChange={(e) => {
            const el = e.target as HTMLInputElement;
            const shader = el.value as any;
            setShaderName(shader);
            const newURL = new URL(location.href);
            newURL.search = "?shader=" + shader;
            history.pushState(null, document.title, newURL.href);
          }}
        >
          <h4>Shaders</h4>
          {shaders.map((x) => {
            const [name] = x;
            return (
              <label style={{ display: "block" }} key={name}>
                <input
                  defaultChecked={fsName === name}
                  type="radio"
                  key={name}
                  name="fsName"
                  value={name}
                />
                {name}
              </label>
            );
          })}
        </div>
        <div>
          <h4>Parameters</h4>
          {params.map((x, i) => {
            return (
              <label style={{ display: "block" }} key={i}>
                <span style={{ marginRight: 2 }}>{["x", "y", "z"][i]}</span>
                <input
                  type="range"
                  value={String(magicNumberState[i])}
                  max={500}
                  min={0}
                  step={1}
                  onChange={(e) => {
                    params[i] = e.currentTarget.valueAsNumber;
                    setMagicNumberState([...params]);
                  }}
                />
                <input
                  type="number"
                  value={String(magicNumberState[i])}
                  max={500}
                  min={0}
                  step={1}
                  onChange={(e) => {
                    params[i] = e.currentTarget.valueAsNumber;
                    setMagicNumberState([...params]);
                  }}
                />
              </label>
            );
          })}
        </div>
        <div>
          <p>
            mouse is currently at (<span ref={coordinateDisplayRef}></span>)
          </p>
        </div>
        {error ? <pre style={{ color: "red" }}>{error.message}</pre> : null}
        <pre>
          <code
            ref={editorRef}
            contentEditable
            onFocus={(e) => {}}
            onInput={(e) => {
              if (e.target["timer"]) {
                clearTimeout(e.target["timer"]);
                e.target["timer"] = null;
              } else {
                e.target["timer"] = setTimeout(() => {
                  setShader(e.currentTarget.innerText);
                }, 2000);
              }
            }}
          />
        </pre>
      </div>
      <div id="canvas-right">
        <canvas
          style={{
            position: "relative",
            // background:"red",
            width: WIDTH,
            height: HEIGHT,
            top: 0,
            transition: "top .4s ease",
            // top:0,
          }}
          height={HEIGHT * devicePixelRatio}
          width={WIDTH * devicePixelRatio}
          ref={canvasRef}
        />
      </div>
    </>
  );
}

function makePlaneGeometryEBO(xSegments: number, ySegments: number) {
  let index = new Uint8Array(xSegments * ySegments * 6);
  let rowSize = xSegments + 1;
  let rowCount = ySegments + 1;
  for (let y = 0; y < rowCount - 1; y++) {
    for (let x = 0; x < rowSize - 1; x++) {
      const i = y * rowSize + x;
      /**
       *  i+rowSize   i+rowSize+1
       *  i           i+1
       */
      index.set(
        [i, i + 1, i + rowSize + 1, i + rowSize + 1, i + rowSize, i],
        (i - y) * 6
      );
    }
  }
  return index;
}
