require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
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
