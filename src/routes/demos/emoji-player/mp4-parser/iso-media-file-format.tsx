import { describeType, describeAbstract } from "./types";
import { ab2str, timestamp1904 } from "../utils";
import {getLanguageFromBuffer} from "../iso-639-2-t"
import { repeat, readMatrix, getCurrentTrackInfo} from "./description-utils";
import * as React from "react"
import { GlobalData } from "./mp4-parser";

describeType("ftyp",{
    name:"File Type Box",
    desc:"file header",
    data:(r)=>{
        const brandsLength = (r.byteLength - 8) /4
        return {
            major_brand:ab2str(r.get(4)),
            minor_version:r.getUint32(),
            compatible_brands:repeat(brandsLength,()=>ab2str(r.get(4)))
        }
    }
})

describeType("mdat", {
    name:"Media Data Box",
    desc:"This box contains the media data.",
    data:r=>r
})

describeType("free",{
    name:"Free Space Box",
    desc:"The contents of a free-space box are irrelevant and may be ignored.",
})

describeType("skip",{
    name:"Free Space Box",
    desc:"The contents of a free-space box are irrelevant and may be ignored.",
})

describeType("pdin",{
    name:"Progressive Download Information Box",
    desc:"The Progressive download information box aids the progressive download of an ISO file.",
    data:(r)=>{
        let pairs = []
        for(let i=0;i<r.byteLength;i+=8){
            const rate = r.getUint32()
            const initial_delay = r.getUint32()
            pairs.push({
                rate,initial_delay
            })
        }
        return <table>
            <thead><tr>
                <th>Rate</th>
                <th>Initial delay</th>
            </tr></thead>
            {
                pairs.map((x,i)=><tr key={i}><td>{x.rate}</td><td>{x.initial_delay}</td></tr>)
            }
        </table>
    }
})

describeType("moov",{
    name:"Movie Box",
    desc:"The metadata for a presentation",
})

describeType("mvhd",{
    name:"Movie Header Box",
    container:['moov'],
    desc:"This box defines overall information which is media-independent, and relevant to the entire presentation considered as a whole.",
    data:(r)=>{
        const versionAndFlags = r.getUint32()
        const version = versionAndFlags >> 24
        return {
            create_time: timestamp1904(version?r.getUint64():r.getUint32()),
            modification_time: timestamp1904(version?r.getUint64():r.getUint32()),
            time_scale: r.getUint32(),
            duration: version?r.getUint64():r.getUint32(),
            rate : r.getUint32() >> 16,
            volumn: r.getUint16() >> 8,
            matrix:  r.skip(10) && readMatrix(r),
            next_track_ID: r.skip(24) && r.getUint32()
        }
    },
})

describeType("trak",{
    name:"Track Box",
    desc:"This is a container box for a single track of a presentation.",
    container:["moov"],
})

describeType<GlobalData>("tkhd",{
    name:"Track Header Box",
    desc:"This box specifies the characteristics of a single track.",
    container:["trak"],
    data:(r,data)=>{
        const versionAndFlags = r.getUint32()
        const version = versionAndFlags >> 24
        const flags = versionAndFlags
        return {
            track_enabled: 0b1 & flags,
            track_in_movie:0b10 & flags >> 1,
            track_in_preview:0b100 & flags >> 2,
            track_size_is_aspect_ratio: 0x8 & flags,
            create_time: timestamp1904(version?r.getUint64():r.getUint32()),
            modification_time: timestamp1904(version?r.getUint64():r.getUint32()),
            track_id:data.currentTrackID = r.getUint32(),
            duration:r.skip(4) && version ? r.getUint64():r.getUint32(),
            layer: r.skip(8) && r.getUint16(),
            alternate_group:r.getUint16(),
            volume: r.getUint16() >> 8,
            matrix: r.skip(2) && readMatrix(r),
            width: r.getUint32() >> 16,
            height: r.getUint32() >> 16
        }
    }
})

describeType("tref",{
    name:"Track Reference Box",
    desc:"This box provides a reference from the containing track to another track in the presentation.",
    container:["trak"],
    data:()=>"todo"
})

describeType("trgr",{
    name:"Track Group Box",
    container:["trak"],
    desc:"This box enables indication of groups of tracks, where each group shares a particular characteristic or the tracks within a group have a particular relationship.",
    data:()=>"todo"
})

describeType("mdia",{
    name:"Track Media Box",
    container:["trak"],
    desc:"The media declaration container contains all the objects that declare information about the media data within a track."
})

describeType("mdhd",{
    name:"Media Header Box",
    container:["mdia"],
    desc:"The media header declares overall information that is media-independent, and relevant to characteristics of the media in a track.",
    data:(r)=>{
        const versionAndFlags = r.getUint32()
        const version = versionAndFlags >> 24
        return {
            create_time: timestamp1904(version?r.getUint64():r.getUint32()),
            modification_time: timestamp1904(version?r.getUint64():r.getUint32()),
            time_scale:r.getUint32(),
            duration: version ? r.getUint64():r.getUint32(),
            language:getLanguageFromBuffer(r.getUint16())
        }
    }
})

describeType("hdlr",{
    name:"Handler Reference Box",
    container:["mdia","meta"],
    desc:"This box within a Media Box declares media type of the track, and thus the process by which the media-data in the track is presented.",
    data:(r)=>{
        r.skip(8)
        return {
            handler_type:ab2str(r.get(4)),
            name:r.skip(12) && r.getUnicodeString()
        }
    }
})

describeType("minf",{
    name:"Media Information Box",
    container:["mdia"],
    desc:"This box contains all the objects that declare characteristic information of the media in the track."
})

describeType("nmhd",{
    name:"Null Media Header Box",
    container:["minf"],
    desc:"Streams for which no specific media header is identified use a null Media Header Box."
})

describeType("elng",{
    name:"Extended language tag",
    container:["mdia"],
    desc:"The extended language tag box represents media language information, based on RFC 4646 (Best Common Practices – BCP – 47) industry standard."
})

describeType("stbl",{
    name:"Sample Table Box",
    container:["minf"],
    desc:"The sample table contains all the time and data indexing of the media samples in a track."
})

describeType("stsd",{
    name:"Sample Description Box",
    container:["stbl"],
    desc:"The sample description table gives detailed information about the coding type used, and any initialization information needed for that coding.",
    childrenOffset:8,
    children:new Set(),
    data:(r)=>{
        r.getUint32()//version and flags
        const handler_type = r.getUint32()
        return {
            handler_type
        }
    }
})

describeType<GlobalData>("stdp",{
    name:"Degradation Priority Box",
    desc:"This box contains the degradation priority of each sample.",
    container:['stbl'],
    data(r,context){
        const {sampleCount} = getCurrentTrackInfo(context)
        r.getUint32()
        if(sampleCount>0)
            return repeat(sampleCount,x=><span>{r.getUint16()}<br/></span>)
        return null
    }
})

describeType("stts",{
    name:"Decoding Time to Sample Box",
    desc:"This box contains a compact version of a table that allows indexing from decoding time to sample number.",
    container:['stbl'],
    data(r){
        r.getUint32()
        const entry_count = r.getUint32()
        return repeat(entry_count,()=>{
            return {
                sample_count:r.getUint32(),
                sample_delta:r.getUint32(),
            }
        })
    }
})

describeType("ctts",{
    name:"Composition Time to Sample Box",
    desc:"This box provides the offset between decoding time and composition time.",
    container:['stbl'],
    data(r){
        const versionAndFlags = r.getUint32()
        const version = versionAndFlags >> 24
        const entry_count = r.getUint32()
        return repeat(entry_count,()=>{
            return {
                sample_count:r.getUint32(),
                sample_offset:version?r.getInt32():r.getUint32(),
            }
        })
    }
})

describeType("cslg",{
    name:"Composition to Decode Box",
    desc:"When signed composition offsets are used, this box may be used to relate the composition and decoding timelines, and deal with some of the ambiguities that signed composition offsets introduce.",
    container:['stbl','trep'],
    data(r){
        const version = r.getInt32() >> 24
        return {
            compositionToDTSShift: version? r.getInt64():r.getInt32(),
            leastDecodeToDisplayDelta: version? r.getInt64():r.getInt32(),
            greatestDecodeToDisplayDelta:version? r.getInt64():r.getInt32(),
            compositionStartTime:version? r.getInt64():r.getInt32(),
            compositionEndTime:version? r.getInt64():r.getInt32(),
        }
    }
})

describeType("stss",{
    name:"Sync Sample Box",
    desc:"This box provides a compact marking of the sync samples within the stream.",
    container:['stbl'],
    data(r){
        r.getUint32()
        const entry_count = r.getUint32()
        return repeat(entry_count,()=>{
            return r.getInt32()
        })
    }
})

describeType("stsh",{
    name:"Shadow Sync Sample Box",
    desc:"The shadow sync table provides an optional set of sync samples that can be used when seeking or for similar purposes. In normal forward play they are ignored.",
    container:['stbl'],
    data(r){
        r.getUint32()
        const entry_count = r.getUint32()
        return repeat(entry_count,()=>{
            return {
                shadowed_sample_number:r.getUint32(),
                sync_sample_number:r.getUint32()
            }
        })
    }
})

describeType<GlobalData>("sdtp",{
    name:"Independent and Disposable Samples Box",
    desc:"This optional table answers questions about sample dependency.",
    container:['stbl'],
    data(r,context){
        const {sampleCount} = getCurrentTrackInfo(context)
        r.getUint32()
        if(sampleCount > 0)
            return repeat(sampleCount,()=>{
                const flags = r.getUint8()
                return {
                    is_leading:             (0b11000000 & flags) >> 6,
                    sample_depends_on:      (0b00110000 & flags) >> 4,
                    sample_is_depended_on:  (0b00001100 & flags) >> 2,
                    sample_has_redundancy:  0b00000011 & flags,
                }
            })
        return null
    }
})

describeType("edts",{
    name:"Edit Box",
    desc:"An Edit Box maps the presentation time-line to the media time-line as it is stored in the file.",
    container:['trak']
})

describeType("elts",{
    name:"Edit List Box",
    desc:"This box contains an explicit timeline map.",
    container:['edts'],
    data:()=>"todo"
})

describeType("dinf",{
    name:"Data Information Box",
    desc:"The data information box contains objects that declare the location of the media information in a track.",
    container:['minf','meta']
})

describeType("dref",{
    name:"Data Reference Box",
    container:['dinf'],
    desc:"See children.",
    childrenOffset:8, //version flag entry count
})

describeType("url ",{
    name:"URL Box",
    container:['dref'],
    desc:"Data Entry Url Box",
    data:(r)=>{
        const flags = r.getInt32()
        const is_in_the_same_file = flags & 0x1
        return {
            is_in_the_same_file,
            url:r.getString()
        }
    }
})

describeType("urn ",{
    name:"Urn Box",
    container:['dref'],
    desc:"Data Entry Urn Box",
    data:(r)=>{
        const flags = r.getInt32()
        const is_in_the_same_file = flags & 0x1
        return {
            is_in_the_same_file,
            name:r.getString(),
            url:r.getString()
        }
    }
})

describeType<GlobalData>("stsz",{
    name:"Sample Size Box",
    desc:"This box contains the sample count and a table giving the size in bytes of each sample.",
    container:['stbl'],
    data(r,context){
        const trackInfo = getCurrentTrackInfo(context)
        r.getUint32()
        const sample_size = r.getUint32()
        const sample_count = trackInfo.sampleCount = r.getUint32()
        const entry_sizes = sample_size === 0? repeat(sample_count,()=>r.getUint32()):null
        trackInfo.sampleSizes = entry_sizes || sample_size
        return ({
            sample_size,
            sample_count,
            entry_sizes
        })
    }
})

describeType<GlobalData>("sts2",{
    name:"Sample Size Box",
    desc:"This box contains the sample count and a table giving the size in bytes of each sample.",
    container:['stbl'],
    data(r,context){
        const trackInfo = getCurrentTrackInfo(context)
        r.getUint32()
        const sample_size = r.getUint32()
        const sample_count = trackInfo.sampleCount = r.getUint32()
        const entry_sizes = sample_count===0? repeat(sample_count,x=>{
            //todo field_size maybe 4
            return sample_size===8?r.getUint8():r.getUint16()
        }) : null
        trackInfo.sampleSizes = entry_sizes || sample_size
        return ({
            sample_size,
            sample_count,
            entry_sizes
        })
    }
})

describeType<GlobalData>("stsc",{
    name:"Sample To Chunk Box",
    desc:"Samples within the media data are grouped into chunks. Chunks can be of different sizes, and the samples within a chunk can have different sizes. This table can be used to find the chunk that contains a sample, its position, and the associated sample description.",
    container:['stbl'],
    data(r,context){
        r.skip(4)
        const currentTrackInfo = getCurrentTrackInfo(context)
        const entry_count = r.getUint32()
        const sampleToChunks = repeat(entry_count,()=>({
            firstChunk:r.getUint32(),
            samplesPerChunk:r.getUint32(),
            sampleDescriptionIndex:r.getUint32()
        }))
        currentTrackInfo.sampleToChunks = sampleToChunks
        return sampleToChunks
    }
})

describeType<GlobalData>("stco",{
    name:"Chunk Offset Box",
    desc:"The chunk offset table gives the index of each chunk into the containing file.",
    container:['stbl'],
    data(r,context){
        r.skip(4)
        const currentTrackInfo = getCurrentTrackInfo(context)
        const entry_count = r.getUint32()
        const chunkOffsets = repeat(entry_count,()=>r.getUint32())
        currentTrackInfo.chunkOffsets = chunkOffsets
        return chunkOffsets
    }
})

describeType("co64",{
    name:"Chunk Large Offset Box",
    desc:"The chunk offset table gives the index of each chunk into the containing file.",
    container:['stbl']
})

describeType("padb",{
    name:"Padding Bits Box",
    desc:"In some streams the media samples do not occupy all bits of the bytes given by the sample size, and are padded at the end to a byte boundary.",
    container:['stbl']
})

describeType("subs",{
    name:"Sub Sample Box",
    desc:"Contain sub-sample information.",
    container:['stbl','traf'],
    data:()=>"todo"
})

describeType("saiz",{
    name:"Sample Auxiliary Information Sizes Box",
    desc:"Per-sample sample auxiliary information.",
    container:['stbl','traf'],
    data:()=>"todo"
})

describeType("saio",{
    name:"Sample Auxiliary Information Offsets Box",
    desc:"Per-sample sample auxiliary information.",
    container:['stbl','traf'],
    data:()=>"todo"
})

describeType("mvex",{
    name:"Movie Extends Box",
    desc:"This box warns readers that there might be Movie Fragment Boxes in this file.",
    container:['moov'],
})

describeType("mehd",{
    name:"Movie Extends Header Box",
    desc:"The Movie Extends Header is optional, and provides the overall duration, including fragments, of a fragmented movie.",
    container:['mvex'],
    data:()=>"todo"
})

describeType("trex",{
    name:"Track Extends Box",
    desc:"This sets up default values used by the movie fragments.",
    container:['mvex'],
    data:()=>"todo"
})

describeType("moof",{
    name:"Movie Fragment Box",
    desc:"The movie fragments extend the presentation in time.",
})

describeType("mfhd",{
    name:"Movie Fragment Header Box",
    desc:"The movie fragment header contains a sequence number, as a safety check.",
    data:r=>r.skip(4) && r.getInt32()
})

describeType("traf",{
    name:"Track Fragment Box",
    desc:"Within the movie fragment there is a set of track fragments, zero or more per track.",
    container:['moof'],
})

describeType("tfhd",{
    name:"Track Fragment Header Box",
    desc:"Each movie fragment can add zero or more fragments to each track; and a track fragment can add zero or more contiguous runs of samples.",
    container:['traf'],
    data:()=>"todo"
})

describeType("trun",{
    name:"Track Fragment Run Box",
    desc:"A track run documents a contiguous set of samples for a track.",
    container:['traf'],
    data:()=>"todo"
})

describeType("mfra",{
    name:"Movie Fragment Random Access Box",
    desc:"The Movie Fragment Random Access Box (‘mfra’) provides a table which may assist readers in finding sync samples in a file using movie fragments.",
})

describeType("tfra",{
    name:"Track Fragment Random Access Box",
    container:['mfra'],
    desc:"Each entry contains the location and the presentation time of the sync sample. Note that not every sync sample in the track needs to be listed in the table.",
    data:()=>"todo"
})

describeType("mfro",{
    name:"Movie Fragment Random Access Offset Box",
    container:['mfra'],
    desc:"The Movie Fragment Random Access Offset Box provides a copy of the length field from the enclosing Movie Fragment Random Access Box.",
    data:()=>"todo"
})

describeType("tfdt",{
    name:"Track Fragment Decode Time Box",
    desc:"The Track Fragment Base Media Decode Time Box provides the absolute decode time, measured on the media timeline, of the first sample in decode order in the track fragment",
    container:['traf'],
    data:()=>"todo"
})

describeType("leva",{
    name:"Track Fragment Decode Time Box",
    desc:"Levels specify subsets of the file.",
    container:['mvex'],
    data:()=>"todo"
})

describeType("sbgp",{
    name:"Sample to Group Box",
    desc:"This table can be used to find the group that a sample belongs to and the associated description of that sample group.",
    container:['stbl','traf'],
    data:()=>"todo"
})

describeType("sgpd",{
    name:"Sample Group Description Box",
    desc:"This description table gives information about the characteristics of sample groups.",
    container:['stbl','traf'],
    data:()=>"todo"
})

describeType("udta",{
    name:"User Data Box",
    desc:"This box contains objects that declare user information about the containing box and its data (presentation or track).",
    container:['stbl','traf'],
})

describeType("cprt",{
    name:"Copy Right Box",
    desc:"The Copyright box contains a copyright declaration which applies to the entire presentation, when contained within the Movie Box, or, when contained in a track, to that entire track.",
    container:['udta'],
    data:(r)=>{
        r.getInt32()
        return {
            language: getLanguageFromBuffer(r.getUint16()),
            notice: r.getString()
        }
    }
})

describeType("tsel",{
    name:"Track Selection Box",
    desc:"The track selection box is contained in the user data box of the track it modifies.",
    container:['udat'],
    data:()=>"todo"
})

describeType("kins",{
    name:"Track Kind Box",
    desc:"The Kind box labels a track with its role or kind.",
    container:['udat'],
    data:()=>"todo"
})

describeType("meta",{
    name:"Meta Box",
    desc:"A meta box contains descriptive or annotative metadata.",
    childrenOffset:4,
    container:['moov','trak','meco','moof','traf'],
})

describeType("xml ",{
    name:"XML Box",
    desc:"XML",
    container:['meta'],
    data:()=>"todo"
})

describeType("bxml",{
    name:"XML Box",
    desc:"XML",
    container:['meta'],
    data:()=>"todo"
})

describeType("iloc",{
    name:"Item Location Box",
    desc:"The item location box provides a directory of resources in this or other files, by locating their container, their offset within that container, and their length.",
    container:['meta'],
    data:()=>"todo"
})

describeType("pitm",{
    name:"Primary Item Box",
    desc:"For a given handler, the primary data may be one of the referenced items when it is desired that it be stored elsewhere, or divided into extents; or the primary metadata may be contained in the meta-box (e.g. in an XML box).",
    container:['meta'],
    data:()=>"todo"
})

describeType("ipro",{
    name:"Item Protection Box",
    desc:"The item protection box provides an array of item protection information, for use by the Item Information Box.",
    container:['meta'],
    data:()=>"todo"
})

describeType("iint",{
    name:"Item Information Box",
    desc:"The Item information box provides extra information about selected items, including symbolic (‘file’) names. It may optionally occur, but if it does, it must be interpreted, as item protection or content encoding may have changed the format of the data in the item.",
    container:['meta'],
    data:()=>"todo"
})

describeType("meco",{
    name:"Additional Metadata Container Box",
    desc:"The additional metadata container box includes one or more meta boxes.",
    container:['moov','trak'],
})

//todo: incomplete.

describeAbstract("Sample Entry Box",{
    name:"Sample Entry Box",
    desc:"Sample Entry Box",
    data:(r)=>{
        return ({
            data_reference_index:r.skip(6) && r.getUint16(),
        })
    }
})

describeAbstract("Visual Sample Entry",{
    name:"Visual Sample Entry Box",
    desc:"Visual Sample Entry Box",
    extends:"Sample Entry Box",
    data:(r)=>{
        return ({
            width:r.getUint16() >> 8,
            height:r.getUint16() >> 8,
            horizresolution: r.getUint32() >> 8,
            vertresolution  : r.getUint32() >> 8,
            frame_count: r.skip(4) && r.getUint16(),
            compressorname: ab2str(r.get(32)),
            depth: r.getUint16(),
        })
    }
})

describeAbstract("Audio Sample Entry",{
    name:"Audio Sample Entry Box",
    desc:"Audio Sample Entry Box",
    extends:"Sample Entry Box",
    data:(r)=>{
        r.skip(8)
        return ({
            channelcount:r.getUint16(),
            samplesize:r.getUint16(),
            samplerate:r.skip(4) && (r.getUint32()/65536),
        })
    }
})