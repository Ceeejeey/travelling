import express from "express";
import  {addPackage, deletePackageByName } from "../controller/packagecontroller.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import verifyToken from "../middleware/verifyToken.js";
import PackageModel from "../schema/PackageSchema.js";

const router = express.Router();

const packageUploadFields = upload.fields([
  { name: "image", maxCount: 1 },    // main image
  { name: "image1", maxCount: 1 },   // sub image 1
  { name: "image2", maxCount: 1 },   // sub image 2
  { name: "image3", maxCount: 1 },   // sub image 3
]);


router.post("/add",adminAuth, packageUploadFields, addPackage);
router.delete('/delete/:name', verifyToken, deletePackageByName);
router.get('/pkgdetail',async(req,res) =>{
  try{
    const pkg =await PackageModel.find();
    res.json(pkg);

  }catch(error){
    res.json({error:err.message})
  }
});





export default router;
