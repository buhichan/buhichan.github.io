(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{"./src/routes/demos/emoji-player/index.tsx":function(e,t,n){"use strict";n.r(t);var a=n("react"),r=n("./node_modules/rxjs/_esm5/internal/Subject.js");const s=document.createElement("canvas");function i(e,t){const n=document.createElement("img");return n.src=URL.createObjectURL(e),new Promise(e=>{n.onload=()=>{const a=n.width/t,r=n.height/t;s.height=n.height,s.width=n.width;const i=s.getContext("2d");i.drawImage(n,0,0);let l=[];for(let e=0;e<r;e++){let n=[];for(let r=0;r<a;r++){const a=i.getImageData(r*t,e*t,1,1);n.push(a.data)}l.push(n)}e(l)}})}document.body.append(s);const l=["🧑🏿","🧑🏾","🧑🏽","🧑🏼","🧑🏻"];let o=30,c=30;function u(e){const[t,n]=a.useState([]),[s,u]=a.useState(`-ss 00:00:00 -i input.webm -vframes ${o*c} output-%03d.jpg`),d=a.useRef(null),m=e=>{d.current&&(d.current.innerHTML=e)};return a.useEffect(()=>{if(!e.file||!s)return;n([]),m("loading..., please wait.");const{output:t,files:a}=function(e,t){const n=e.type,[a,s]=n.split("/"),i=new r.a,l=new r.a;return function(e){return new Promise((t,n)=>{const a=new FileReader;a.readAsArrayBuffer(e),a.onload=()=>{t(a.result)},a.onerror=n})}(e).then(e=>{var n=new Uint8Array(e);let a="webm"===s?new Worker("nm/ffmpeg.js/ffmpeg-worker-webm.js"):"mp4"===s?new Worker("nm/ffmpeg.js/ffmpeg-worker-mp4.js"):null;if(!a)return[];a.postMessage({type:"run",MEMFS:[{name:`input.${s}`,data:n}],arguments:t.concat("-hide_banner")});a.addEventListener("message",e=>{"exit"===e.data.type||("done"===e.data.type?(l.next(e.data.data.MEMFS),a.terminate(),l.complete(),i.complete()):i.next(e.data))})}),{output:i,files:l}}(e.file,s.split(" ")),c=t.pipe().subscribe(e=>{if(e.data&&e.data.startsWith("frame=")){const[t,n]=e.data.split(/\s+/g);m(`${n}/900`)}});return a.subscribe(async e=>{console.log(`got ${e.length} images`);let t=[],n=null;for(let a in e){const r=e[a],s=new Blob([r.data],{type:"image/jpeg"}),c=await i(s,20);if(t.push(c.map(e=>e.map(e=>{const t=2*(.2126*e[0]/255+.7152*e[1]/255+.0722*e[2]/255);return l[Math.min(Math.floor(t*l.length),l.length-1)]}).join("")).join("\n")),null===n){n=0;let a=setInterval(()=>{n>t.length-1?m(t[t.length-1]):(m(t[t.length-1]),n++),n===e.length&&clearInterval(a)},1e3/o)}}}),()=>c.unsubscribe()},[e.file,s]),a.createElement("div",null,"Can Only Play the first 900 frames.",a.createElement("div",null),a.createElement("style",null,".pixel{\n                display:inline-block;\n                width:10px;\n                height:10px;\n            }"),a.createElement("div",{ref:d,style:{whiteSpace:"pre-wrap"}}))}function d(e){let t,n=[],a=!1;const r=new FileReader;return r.readAsArrayBuffer(e),r.addEventListener("load",function(){t=r.result,a=!0,function(){for(;n.length>0;){const{resolve:e,size:a}=n[0];if(!(a<=t.byteLength))break;{let r=0===a?1/0:a,s=t.slice(0,r);t=t.slice(r),n.shift(),e(s)}}}()},!1),{readBytes:function(e){if(t&&t.byteLength>=e){let n=t.slice(0,e);return t=t.slice(e),Promise.resolve(n)}return a?Promise.resolve(m):new Promise(t=>{n.push({resolve:t,size:e})})}}}const m=new ArrayBuffer(0);function f(e){const t=new Uint8Array(e);return(t[0]<<8)+t[1]}function w(e){const t=new Uint8Array(e);return(t[0]<<16)+(t[1]<<8)+t[2]}function p(e){const t=new Uint8Array(e);return(t[0]<<24)+(t[1]<<16)+(t[2]<<8)+t[3]}new ArrayBuffer(0);Math.floor(16.5);async function y(e,t){let n=0;if(t){n=p(await e.readBytes(4))}else{n=f(await e.readBytes(2))}return n?(a=await e.readBytes(n),String.fromCharCode.apply(null,new Uint8Array(a))):"";var a}async function h(e){let t=new Uint8Array(await e.readBytes(1))[0];switch(t){case 0:return new DataView(await e.readBytes(8)).getFloat64(0);case 1:return new Uint8Array(await e.readBytes(1))[0]>0;case 2:case 4:return await y(e,!1);case 3:return await g(e);case 5:return null;case 6:return;case 7:return f(await e.readBytes(2));case 8:return await e.readBytes(4),await g(e);case 10:{let t={},n=p(await e.readBytes(4));for(;n-- >0;){const n=await y(e,!1),a=await h(e);t[n]=a}return t}case 11:{const t=new DataView(await e.readBytes(8)).getFloat64(0);return await e.readBytes(2),new Date(t)}case 12:return await y(e,!0)}}async function g(e){const t={};let n=100;for(;n-- >0;){const n=await y(e,!1);if(0===n.length){const t=await e.readBytes(1);if(9===new Uint8Array(t)[0])break;throw new Error("unexpected end")}const a=await h(e);t[n]=a}return t}const E=["Linear PCM, platform endian","ADPCM","mp3","Linear PCM, little endian","Nellymoser 16-kHz mono","Nellymoser 8-kHz mono","Nellymoser","G.711 A-law logarithemic PCM","G.711 mu-law logarithemic PCM","reserved","AAC","Speex","MP3 8-Khz","Device-Specific sound"],v=["5.5-kHz","11-kHz","22-kHz","44-kHz"],b=["snd8Bit","snd16Bit"],B=["sndMono","sndStereo"],k=["keyframe","inter frame","disposable inter frame","generated keyframe","video info/command frame"],A=["JPEG","Sorenson H.263","Screen video","On2 VP6","On2 VP6 with alpha channel","Screen video v2","AVC"];function S(e){const t=e.tags;return a.createElement("div",null,a.createElement("ul",null,t.map((e,t)=>a.createElement("li",{key:t},a.createElement("p",null,e.type),a.createElement("p",null,"size:",e.size),a.createElement("p",null,"previous tag size:",e.previousTagSize),(()=>{switch(e.type){case"audio":return a.createElement("div",null,a.createElement("p",null,"soundFormat:",E[e.data.soundFormat]),a.createElement("p",null,"soundType:",B[e.data.soundType]),a.createElement("p",null,"soundSize:",b[e.data.soundSize]),a.createElement("p",null,"codecID:",v[e.data.soundRate]));case"video":return a.createElement("div",null,a.createElement("p",null,"frameType:",k[e.data.frameType]),a.createElement("p",null,"codecID:",A[e.data.codecID]));case"script":return a.createElement("pre",null,`${e.data.method}(${JSON.stringify(e.data.args,null,"\t")})`)}})()))))}function z(){const[e,t]=a.useState(null),[n,r]=a.useState(null),s=e=>{e.type.includes("flv")&&async function(e){const t=await e.readBytes(9),n=new DataView(t).getUint32(5);await e.readBytes(n-9);const a=[];for(;;)try{let t={};t.previousTagSize=new DataView(await e.readBytes(4)).getUint32(0);const n=await e.readBytes(1);if(!n)break;const r=new Uint8Array(n)[0];t.type=8===r?"audio":9===r?"video":18===r?"script":null,t.size=w(await e.readBytes(3));const s=w(await e.readBytes(3)),i=await e.readBytes(1);switch(t.timestamp=s+(new Uint8Array(i)[0]<<24),t.streamID=w(await e.readBytes(3)),t.type){case"audio":{let n={};const a=new Uint8Array(await e.readBytes(1))[0];n.soundFormat=a>>4,n.soundRate=(a>>2)%4,n.soundSize=(a>>1)%2,n.soundType=a%2,n.data=await e.readBytes(t.size-1),t.data=n;break}case"video":{let n={};const a=new Uint8Array(await e.readBytes(1))[0];n.frameType=a>>4,n.codecID=a%16,n.data=await e.readBytes(t.size-1),t.data=n;break}case"script":{let n={};n.method=await h(e),n.args=await h(e),t.data=n;break}}a.push(t)}catch(e){return console.error(`Error while parsing the ${a.length+1}th tag: \n`,e),a}return a}(d(e)).then(t)};return a.useEffect(()=>{r(null),fetch("assets/barsandtone.flv").then(e=>e.blob()).then(s).catch(r)},[]),a.createElement("div",null,n&&a.createElement("div",{style:{color:"#f00"}},n.stack),a.createElement("input",{type:"file",accept:"video/webm",onChange:e=>{if(!e.currentTarget.files)return;const t=e.currentTarget.files[0];t&&s(t)}}),e&&a.createElement(S,{tags:e}))}function M(){if("localhost"===location.hostname)return a.createElement(z,null);const[e,t]=a.useState(null);return a.useEffect(()=>{fetch("assets/big_buck_bunny.webm").then(e=>e.blob()).then(t)},[]),a.createElement("div",null,a.createElement("input",{type:"file",accept:"video/webm",onChange:e=>{if(!e.currentTarget.files)return;const n=e.currentTarget.files[0];n&&t(n)}}),e?a.createElement(u,{file:e}):null)}n.d(t,"default",function(){return M})}}]);