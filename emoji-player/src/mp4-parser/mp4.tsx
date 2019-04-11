import { describeType } from "./types";

describeType("iods", {
    name:"Object Description Box",
    desc:"This object contains an Object Descriptor or an Initial Object Descriptor. ",
    container:['moov'],
    data:r=>r.getString()
})

describeType("mp4a",{
    name:"MP4 Audio Sample Box",
    container:["stsd"],
    childrenOffset:0x1c,
    extends:"Audio Sample Entry",
    desc:"MP4AudioSampleEntry"
})

describeType("mp4v",{
    name:"MP4 Visual Sample Entry",
    container:["stsd"],
    childrenOffset:0x1c,
    extends:"Visual Sample Entry",
    desc:"MP4VisualSampleEntry",
})

describeType("mp4s",{
    name:"Mpeg Sample Entry",
    childrenOffset:0x1c,
    container:["stsd"],
    extends:"Sample Entry",
    desc:"MpegSampleEntry"
})

describeType("esds",{
    name:"ESD Box",
    container:['mp4a','mp4s','mp4v'],
    desc:"ES descriptor box",
    data:r=>`<ESD ${r.byteLength} bytes>`
})