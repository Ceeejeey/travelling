// cloudinary/cloudinary.js (or wherever this file is)
import { v2 as cloudinary } from 'cloudinary'; // Import v2 as cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,         // Ensure this matches your .env or system variable
  api_key: process.env.CLOUDINARY_API_KEY,     // Ensure this matches
  api_secret: process.env.CLOUDINARY_SECRET_KEY, // Ensure this matches
  secure: true, // It's good practice to add this for HTTPS URLs
});

// Now, export the configured cloudinary object directly
export default cloudinary;