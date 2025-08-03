import includeModel from "../schema/includesSchema.js";
import cloudinary from "../cloudinary/cloudinary.js";

const addinclude = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.files.image1 && req.files.image1[0];  

    if (!name || !imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    // Create data to save
    const includeData = {
      name,
      image: result.secure_url,
    };

    console.log(includeData);

    const include = new includeModel(includeData);
    await include.save();

    res.json({ success: true, message: "Include data added" });
  } catch (error) {
    console.error("Error adding include:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

 const deleteIncludeByName = async (req, res) => {
  const { name } = req.params;

  try {
    const deletedInclude = await includeModel.findOneAndDelete({ name });

    if (!deletedInclude) {
      return res.status(404).json({ success: false, message: 'Include item not found' });
    }

    res.status(200).json({ success: true, message: 'Include item deleted successfully' });
  } catch (err) {
    console.error('Error deleting include:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { addinclude , deleteIncludeByName}
