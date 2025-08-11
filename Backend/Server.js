import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './router/PackageRoute.js';
import connectDB from './config/mongodb.js';
import session from 'express-session';
import includerouter from './router/includeRouter.js';
import trendrouter from './router/trendingRouter.js';
import loginrouter from './controller/logincontroller.js';
import gallryRouter from './router/GalleryRouter.js';
import paymentRoutes from './router/PaymentRouter.js';


const app = express();
const port = process.env.PORT || 4000;
connectDB();


// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));  

app.use('/api/package', router);
app.use('/api/include', includerouter);
app.use('/api/trending',trendrouter);
app.use('/api/admin',loginrouter);
app.use('/api/gallery',gallryRouter);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log("Server starting on port " + port);
});
