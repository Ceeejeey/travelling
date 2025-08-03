import mongoose from 'mongoose'

const includeSchema = new mongoose.Schema(
    {
          name :{type:String ,required:true },
          image :{type:String , required:true}
    },
    { minimize: false }
);

const includeModel = mongoose.models.include || mongoose.model("include" , includeSchema);
export default includeModel
