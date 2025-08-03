import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    visitingPlaces: [{ type: String, required: true }],
    includes: [{ type: String, required: true }],
    hotel: [{ type: String, required: true }],
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    book_before: { type: String, required: true },
    stay_between: { type: String, required: true },
    image: { type: String, required: true },     // main image
    image1: { type: String, required: true },    // additional image 1
    image2: { type: String, required: true },    // additional image 2
    image3: { type: String, required: true },    // additional image 3
        // additional image 4
    description: { type: String },
    moreDetail: { type: String },
  },
  { minimize: false }
);

const PackageModel =
  mongoose.models.package || mongoose.model("package", PackageSchema);

export default PackageModel;
