require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware — explicitly allow the Vercel frontend and localhost for dev
const allowedOrigins = [
  'https://fusion-dashboard-main.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static mapped uploads for the frontend to access via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple role-based check
const { isAdmin } = require('./middleware/auth');

// Make uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
// We will create mapping to these routes in Step 2.
app.use('/api/upload', isAdmin, require('./routes/uploadRoutes'));
app.use('/api/intelligence', require('./routes/intelligenceRoutes'));

app.get('/', (req, res) => {
  res.send('Intelligence Fusion API Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
