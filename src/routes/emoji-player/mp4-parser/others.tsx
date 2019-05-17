import { describeType } from "./types";

describeType("name",{
    name:"Name Box",
    desc:"???",
    container:['udta'],
    data:r=>r.getString()
})