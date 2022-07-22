import mongoose from "mongoose";
export const formatHashtags = (hashtags) =>
 hashtags.split(",").map((word)=>(word.startsWith("#") ? word : `#${word}`))


const videoSchema = new mongoose.Schema({
    title: {type:String, required: true, trim: true, maxlength:20},
    fileUrl : {type:String, reqired:true },
    description:{type: String, required: true, trim: true, maxlength:20},
    createdAt: {type:Date, required:true, default:Date.now},
    hashtags: [{type:String}],
    meta : {
        views:{type:Number, default:0},
        rating:{type:Number,default:0},
    },
});


const Video = mongoose.model("Video", videoSchema);
export default Video;