import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './router/PackageRoute.js';
import connectDB from './config/mongodb.js';
import includerouter from './router/includeRouter.js';
import trendrouter from './router/trendingRouter.js';
import loginrouter from './controller/logincontroller.js';
import gallryRouter from './router/GalleryRouter.js';


const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));  

app.use('/api/package', router);
app.use('/api/include', includerouter);
app.use('/api/trending',trendrouter);
app.use('/api/admin',loginrouter);
app.use('/api/gallery',gallryRouter);


app.get('/', (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log("Server starting on port " + port);
});
