import * as React from "react";
import { Subject } from "rxjs";
import { getPixelSampleMatrix } from "../jpeg-parser/jpeg-parser";
const dictionary = ["🌑", "🌒", "🌓", "🌔", "🌕"]; //,"🌖","🌗","🌘"]
const skintones = ["🧑🏿", "🧑🏾", "🧑🏽", "🧑🏼", "🧑🏻"];
let FPS = 30;
let VIDEO_LENGTH = 30;
export default function MoonphasePlayer(props) {
    const [line, setLines] = React.useState([]);
    // const [printed,print] = React.useState(null as React.ReactNode)
    const [command, setCommand] = React.useState(`-ss 00:00:00 -i input.webm -vframes ${FPS * VIDEO_LENGTH} output-%03d.jpg`);
    const ref = React.useRef(null);
    const print = (str) => {
        ref.current && (ref.current.innerHTML = str);
    };
    React.useEffect(() => {
        if (!props.file || !command) {
            return;
        }
        setLines([]);
        print("loading..., please wait.");
        const { output, files } = getFrames(props.file, command.split(" "));
        const sub = output.pipe(
        // map(({type,data})=>{
        // return <span style={{
        //     color:type==='stderr'?"red":type==="stdout"?"black":"gray",
        //     display:"block",
        // }}>
        //     {data}    
        // </span>
        // }),
        // scan((a:React.ReactNode[],b:React.ReactNode)=>a.concat(b),[] as React.ReactNode[])
        ).subscribe(x => {
            // if(process.env.NODE_ENV === 'development'){
            if (x.data && x.data.startsWith("frame=")) {
                const [_, currentFrame] = x.data.split(/\s+/g);
                print(`${currentFrame}/900`);
            }
            // console.log(x.data)
            // }
        });
        // const sub = new Subscription()
        // const frame$ = new Subject<React.ReactNode>()
        files.subscribe(async (files) => {
            console.log(`got ${files.length} images`);
            let frames = [];
            let outputIndex = null;
            for (let i in files) {
                const file = files[i];
                const blob = new Blob([file.data], { type: "image/jpeg" });
                const pixels = await getPixelSampleMatrix(blob, 20);
                frames.push(pixels.map(row => {
                    return row.map(pixel => {
                        const brightness = (0.2126 * pixel[0] / 255 + 0.7152 * pixel[1] / 255 + 0.0722 * pixel[2] / 255) * 2;
                        return skintones[Math.min(Math.floor(brightness * skintones.length), skintones.length - 1)];
                        // return `<span class="pixel" style="background: rgba(${pixel.join(",")})"></span>`
                    }).join("");
                }).join("\n"));
                if (outputIndex === null) {
                    outputIndex = 0;
                    let timer = setInterval(() => {
                        if (outputIndex > frames.length - 1) {
                            // frame$.next(frames[frames.length-1])
                            print(frames[frames.length - 1]);
                        }
                        else {
                            // frame$.next(frames[outputIndex])
                            print(frames[frames.length - 1]);
                            outputIndex++;
                        }
                        if (outputIndex === files.length) {
                            clearInterval(timer);
                            // frame$.complete()
                        }
                    }, 1000 / FPS);
                }
            }
        });
        // sub.add(frame$.subscribe(print))
        return () => sub.unsubscribe();
    }, [props.file, command]);
    return React.createElement("div", null,
        "Can Only Play the first 900 frames.",
        React.createElement("div", null),
        React.createElement("style", null, `.pixel{
                display:inline-block;
                width:10px;
                height:10px;
            }`),
        React.createElement("div", { ref: ref, style: { whiteSpace: "pre-wrap" } }));
}
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
    });
}
function getFrames(file, commands) {
    const mime = file.type;
    const [_, subtype] = mime.split("/");
    const output = new Subject();
    const files = new Subject();
    readFile(file).then((data) => {
        var testData = new Uint8Array(data);
        let ffmpeg = subtype === 'webm' ? new Worker("/node_modules/ffmpeg.js/ffmpeg-worker-webm.js") :
            subtype === 'mp4' ? new Worker("/node_modules/ffmpeg.js/ffmpeg-worker-mp4.js") :
                null;
        if (!ffmpeg) {
            return [];
        }
        ffmpeg.postMessage({
            type: "run",
            MEMFS: [{ name: `input.${subtype}`, data: testData }],
            arguments: commands.concat('-hide_banner')
        });
        let i = 0;
        // Write out.webm to disk.
        ffmpeg.addEventListener('message', e => {
            // console.log(e.data.type)
            if (e.data.type === 'exit') {
                // console.log('exit',e.data.data)
            }
            else if (e.data.type === 'done') {
                // console.log(`done`, e.data.data)
                files.next(e.data.data.MEMFS);
                ffmpeg.terminate();
                files.complete();
                output.complete();
            }
            else {
                output.next(e.data);
            }
        });
    });
    return { output, files };
}
//# sourceMappingURL=moonphase-player.js.map