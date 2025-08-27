import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './router/PackageRoute.js';
import connectDB from './config/mongodb.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import csrf from 'csurf';
import includerouter from './router/includeRouter.js';
import trendrouter from './router/trendingRouter.js';
import loginrouter from './controller/logincontroller.js';
import gallryRouter from './router/GalleryRouter.js';
import paymentRoutes from './router/PaymentRouter.js';
import afterPaymenRoutes from './router/afterPaymentRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// -------------------- CONNECT DB --------------------
connectDB();

const mongoUri = process.env.MONGO_URL;
const sessionStore = MongoStore.create({
  mongoUrl: mongoUri,
  collectionName: 'sessions',
});
sessionStore.on('error', (error) => console.error('MongoStore error:', error));
sessionStore.on('connected', () => console.log('MongoStore connected to MongoDB'));

// -------------------- GLOBAL MIDDLEWARE --------------------
app.use(cors({
  origin: ['http://localhost:5173', 'https://ceejeey.me'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- PAYMENT APP --------------------
const paymentApp = express();

// Session first
paymentApp.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'your-secret',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    domain: process.env.NODE_ENV === 'production' ? 'ceejeey.me' : undefined,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    path: '/',
  },
}));

// Debug logger
paymentApp.use((req, res, next) => {
  console.log('Incoming request:', req.path, 'Cookies:', req.headers.cookie, 'Session ID:', req.sessionID);
  next();
});

// Conditional CSRF
const csrfProtection = csrf({ cookie: false });
paymentApp.use((req, res, next) => {
  // Skip CSRF for cleanup endpoints
  if (req.path === '/clear-order' || req.path === '/logout') {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Ensure CSRF token in session
paymentApp.use((req, res, next) => {
  if (!req.session) {
    console.error('No session found for request:', req.path);
    return res.status(500).json({ error: 'Session not initialized' });
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = req.csrfToken();
    res.cookie('_csrf', req.session.csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
    });
    console.log('Generated new CSRF token:', req.session.csrfToken, 'Session ID:', req.sessionID);
  } else {
    console.log('Reusing CSRF token:', req.session.csrfToken, 'Session ID:', req.sessionID);
  }

  if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.path !== '/clear-order' && req.path !== '/logout') {
    const clientToken = req.headers['x-csrf-token'] || req.body._csrf;
    console.log('Validating CSRF token:', {
      clientToken,
      sessionToken: req.session.csrfToken,
      match: clientToken === req.session.csrfToken,
    });
  }

  next();
});

// -------------------- PAYMENT ROUTES --------------------
paymentApp.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

paymentApp.post('/clear-order', (req, res) => {
  console.log('Order cleared for:', req.body);
  res.json({ success: true, message: 'Order cleared' });
});

paymentApp.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('session', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('_csrf', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    console.log('Session cleared via logout, Session ID:', req.sessionID);
    res.json({ success: true, message: 'Session cleared' });
  });
});

// Mount other payment routes
paymentApp.use(paymentRoutes);
paymentApp.use(afterPaymenRoutes);

app.use('/api/payments', paymentApp);
app.use('/api/after-payments', paymentApp);

// -------------------- NON-PAYMENT ROUTES --------------------
app.use('/api/package', router);
app.use('/api/include', includerouter);
app.use('/api/trending', trendrouter);
app.use('/api/admin', loginrouter);
app.use('/api/gallery', gallryRouter);

// -------------------- ROOT --------------------
app.get('/', (req, res) => res.send("API working"));

// -------------------- START --------------------
app.listen(port, () => console.log("Server starting on port " + port));
