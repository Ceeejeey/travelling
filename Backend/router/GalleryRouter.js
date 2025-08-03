import express from 'express'
import { addgallry } from '../controller/galleryController.js'
import upload from '../middleware/multer.js'
import adminAuth from '../middleware/adminAuth.js';
import verifyToken from '../middleware/verifyToken.js';
import galleryModel from '../schema/GallerySchema.js';

const gallryRouter = express.Router();

gallryRouter.post('/add',upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),adminAuth,addgallry);

  gallryRouter.get("/gallerydata",async (req, res) => {
  try {
    const includes = await galleryModel.find();
    res.json(includes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }})
export default gallryRouter;
