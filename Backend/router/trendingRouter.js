import express from 'express'
import { addtrending,deleteTrendingByName } from "../controller/trendingController.js";
import upload from "../middleware/multer.js";
import adminAuth from '../middleware/adminAuth.js';
import verifyToken from '../middleware/verifyToken.js'
import TrendingModel from '../schema/trendingScehema.js';


const trendrouter  =express.Router();

const trendinguploadField = upload.fields([
     { name: "image", maxCount: 1 },
     { name: "image1", maxCount: 1 },
     { name: "image2", maxCount: 1 },
     { name: "image3", maxCount: 1 },
     { name: "image4", maxCount: 1 },
 
])
 trendrouter .post('/add',adminAuth,trendinguploadField , addtrending);
 trendrouter .delete('/delete/:name',verifyToken, deleteTrendingByName);
 trendrouter.get("/trenddata",async (req, res) => {
   try {
     const trends = await TrendingModel.find();
     res.json(trends);
   } catch (err) {
     res.status(500).json({ error: err.message });
   }});
 

 export default trendrouter
