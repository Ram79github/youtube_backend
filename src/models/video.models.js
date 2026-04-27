import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema= new Schema({
    videoFile:{
        type:string ,
        required:true
    },
    thumbnail:{
        type:string ,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId, // reference to the user model
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
 },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,// by cloudinary  
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:false
    }
},{timestamps:true})
// Add pagination plugin to the video schema
videoSchema.plugin(mongooseAggregatePaginate);

export const Video= mongoose.model("Video",videoSchema);
