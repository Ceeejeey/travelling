import mongoose, { mongo } from "mongoose";

const trendingModel = new mongoose.Schema({
  name: { type: String, required: true },
  subname: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  image: { type: String, required: true },
  image1: { type: String, required: true },
  image2: { type: String, required: true },
  image3: { type: String, required: true },
  image4: { type: String, required: true },
},{minimize:false});

const TrendingModel =
  mongoose.models.trending || mongoose.model("trending", trendingModel);
export default TrendingModel;
