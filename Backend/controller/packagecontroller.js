import PackageModel from '../schema/PackageSchema.js';
import cloudinary from '../cloudinary/cloudinary.js';

const addPackage = async (req, res) => {
  try {
    const {
      name,
      visitingPlaces,
      includes,
      hotel,
      price,
      duration,
      book_before,
      stay_between,
      description,
      moreDetail,
    } = req.body;

    // Files from request
    const mainImage = req.files.image && req.files.image[0];
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];

    // Required fields validation
    if (!name || !price || !duration || !book_before || !stay_between || !mainImage) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Helper to parse arrays safely
    const parseArrayField = (field) => {
      try {
        if (typeof field === 'string') {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        }
        return Array.isArray(field) ? field : [];
      } catch {
        return [];
      }
    };

    // Helper function to upload image or return null
    const uploadImage = async (file) => {
      if (!file) return null;
      const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
      return result.secure_url;
    };

    // Upload images in parallel
    const [mainImageUrl, image1Url, image2Url, image3Url] = await Promise.all([
      uploadImage(mainImage),
      uploadImage(image1),
      uploadImage(image2),
      uploadImage(image3),
    ]);

    // Prepare package data
    const packageData = {
      name,
      visitingPlaces: parseArrayField(visitingPlaces),
      includes: parseArrayField(includes),
      hotel: parseArrayField(hotel),
      price: Number(price),
      duration,
      book_before,
      stay_between,
      image: mainImageUrl,
      image1: image1Url,
      image2: image2Url,
      image3: image3Url,
      description: description || '',
      moreDetail: moreDetail || '',
    };

    console.log('Package Data:', packageData);

    const newPackage = new PackageModel(packageData);
    await newPackage.save();

    res.status(201).json({ success: true, message: 'Package added successfully!' });
  } catch (error) {
    console.error('Error adding package:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};





const deletePackageByName = async (req, res) => {
  try {
    const packageName = req.params.name;
    const deleted = await PackageModel.findOneAndDelete({ name: packageName });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export {addPackage, deletePackageByName};