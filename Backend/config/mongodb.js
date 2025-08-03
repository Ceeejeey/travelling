import mongoose from "mongoose";

const connectDB =async() => {
   
    mongoose.connection.on('connected',()=>{
     console.log("db connected")
    })

    await  mongoose.connect(`${process.env.MONGO_URL}/test`)
}

export default connectDB;