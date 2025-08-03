import TrendingModel from "../schema/trendingScehema.js";
import cloudinary from "../cloudinary/cloudinary.js";

const addtrending = async (req, res) => {
  try {
    const { name, subname, description } = req.body;

    // ✅ Get files from request
    const image = req.files.image && req.files.image[0]; // main image
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    // ✅ Validate required fields
    if (!name || !subname || !description || !image) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // ✅ Upload main image
    const mainUpload = await cloudinary.uploader.upload(image.path, {
      resource_type: "image",
    });

    // ✅ Helper function for uploading optional images
    const uploadImage = async (file) => {
      if (!file) return null;
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "image",
      });
      return result.secure_url;
    };

    const img1Url = await uploadImage(image1);
    const img2Url = await uploadImage(image2);
    const img3Url = await uploadImage(image3);
    const img4Url = await uploadImage(image4);

    // ✅ Data to save (matches your schema fields)
    const trendingData = {
      name,
      subname,
      description,
      image: mainUpload.secure_url,
      image1: img1Url,
      image2: img2Url,
      image3: img3Url,
      image4: img4Url,
    };

    console.log(trendingData);

    const trendingItem = new TrendingModel(trendingData);
    await trendingItem.save();

    res.json({ success: true, message: "Trending item added successfully" });
  } catch (error) {
    console.error("Error adding trending:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const deleteTrendingByName = async (req, res) => {
  const { name } = req.params;

  try {
    // Find and delete the trending item by its name
    const deletedTrending = await TrendingModel.findOneAndDelete({ name });

    if (!deletedTrending) {
      return res
        .status(404)
        .json({ success: false, message: "Trending item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Trending item deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting trending:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export { addtrending,deleteTrendingByName };
