import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './router/PackageRoute.js';
import connectDB from './config/mongodb.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import includerouter from './router/includeRouter.js';
import trendrouter from './router/trendingRouter.js';
import loginrouter from './controller/logincontroller.js';
import gallryRouter from './router/GalleryRouter.js';
import paymentRoutes from './router/PaymentRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: true, // Always true for HTTPS
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
  },
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/package', router);
app.use('/api/include', includerouter);
app.use('/api/trending', trendrouter);
app.use('/api/admin', loginrouter);
app.use('/api/gallery', gallryRouter);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log("Server starting on port " + port);
});