import galleryModel from "../schema/GallerySchema.js";
import cloudinary from "../cloudinary/cloudinary.js";

const addgallry = async (req, res) => {
  try {
    const { name } = req.body;

    // Get files safely
    const image = req.files?.image?.[0] || null;
    const image1 = req.files?.image1?.[0] || null;
    const image2 = req.files?.image2?.[0] || null;
    const image3 = req.files?.image3?.[0] || null;
    const image4 = req.files?.image4?.[0] || null;

    // Upload function
    const uploadImage = async (file) => {
      if (!file) return null;
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "image",
        folder: "gallery",
      });
      return result.secure_url;
    };

    // Upload all images in parallel
    const [mainImageUrl, image1Url, image2Url, image3Url, image4Url] =
      await Promise.all([
        uploadImage(image),
        uploadImage(image1),
        uploadImage(image2),
        uploadImage(image3),
        uploadImage(image4),
      ]);

    // Prepare data
    const galleryData = {
      name,
      image: mainImageUrl,
      image1: image1Url,
      image2: image2Url,
      image3: image3Url,
      image4: image4Url,
    };

    // Save to MongoDB
    const gallery = new galleryModel(galleryData);
    await gallery.save();

    res.json({ success: true, message: "Data added successfully", gallery });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { addgallry };
