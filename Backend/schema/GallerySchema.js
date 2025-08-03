import mongoose, { Schema } from "mongoose";

const galerrySchema = new mongoose. Schema({
     name:{type:String ,required:true },
     image :{type:String},
     image1 :{type:String},
     image2 :{type:String},
     image3 :{type:String},
     image4 :{type:String}

},{minimize:false})

const galleryModel = mongoose.model.gallery || mongoose.model("gallery",galerrySchema);

export default galleryModel;