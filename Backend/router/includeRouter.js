import express from 'express';
import { addinclude ,deleteIncludeByName} from '../controller/includeController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import verifyToken from '../middleware/verifyToken.js';
import includeModel from '../schema/includesSchema.js';
const includerouter = express.Router();


includerouter.post("/add",adminAuth, upload.fields([{ name: "image1", maxCount: 1 }]), addinclude);
includerouter.delete('/delete/:name', verifyToken, deleteIncludeByName);
includerouter.get("/includedata",async (req, res) => {
  try {
    const includes = await includeModel.find();
    res.json(includes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }});

export default includerouter;
