const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const exifr = require('exifr');
const IntelligenceNode = require('../models/IntelligenceNode');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload an intelligence file (CSV, JSON, Image)
// @access  Private (Admin)
// For CSV files, we will parse them on the fly
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { mimetype, path: filePath, filename } = req.file;

    // Check if it's an image
    if (mimetype.startsWith('image/')) {
      let lat = req.body.latitude ? parseFloat(req.body.latitude) : null;
      let lon = req.body.longitude ? parseFloat(req.body.longitude) : null;

      let hasGPS = false;

      try {
        const exifData = await exifr.gps(filePath);
        if (exifData && exifData.latitude && exifData.longitude) {
           lat = exifData.latitude;
           lon = exifData.longitude;
           hasGPS = true;
        }
      } catch (err) {
        console.error("EXIF extraction error:", err);
      }

      // Fallback jitter if still null or NaN
      if (lat === null || isNaN(lat)) lat = Math.random() * 60 - 30;
      if (lon === null || isNaN(lon)) lon = Math.random() * 100 - 50;

      // Just save the image, but maybe we need metadata alongside it if user provides title etc.
      // We'll create a basic IntelligenceNode for the image
      const node = new IntelligenceNode({
        title: req.body.title || `Image Upload - ${filename}`,
        sourceType: req.body.sourceType || 'IMINT',
        coordinates: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        description: req.body.description || 'Uploaded image directly via Dashboard.',
        imageUrl: `/uploads/${filename}`,
        metadata: { hasGPS }
      });

      await node.save();
      return res.json({ message: 'Image uploaded successfully', node });
    }

    // Check if it's a CSV
    if (mimetype === 'text/csv' || filename.endsWith('.csv')) {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          
          let parsedCount = 0;
          // Process rows into IntelligenceNodes
          for (const row of results) {
            // Expected columns from CSV (flexible mappings):
            // title, sourceType, lat, long, description, imageUrl
            
            const latitude = parseFloat(row.lat || row.latitude || 0);
            const longitude = parseFloat(row.long || row.longitude || row.lon || 0);

            if (!row.title && latitude === 0 && longitude === 0) {
              continue; // Skip seemingly empty lines
            }

            const node = new IntelligenceNode({
              title: row.title || 'CSV Import',
              sourceType: row.sourceType || 'OSINT',
              coordinates: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON is [long, lat]
              },
              description: row.description || '',
              imageUrl: row.imageUrl || '',
              metadata: row
            });
            await node.save();
            parsedCount++;
          }
          
          return res.json({ message: `CSV processed. Imported ${parsedCount} records.` });
        });
    } else if (mimetype === 'application/json' || filename.endsWith('.json')) {
      // Handle json parsing
      fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read JSON' });
        try {
          const parsedData = JSON.parse(data);
          const nodesToInsert = Array.isArray(parsedData) ? parsedData : [parsedData];
          let inserted = 0;

          for(const item of nodesToInsert) {
             const node = new IntelligenceNode({
               title: item.title || 'JSON Import',
               sourceType: item.sourceType || 'OSINT',
               coordinates: {
                 type: 'Point',
                 coordinates: [parseFloat(item.long || item.longitude || 0), parseFloat(item.lat || item.latitude || 0)]
               },
               description: item.description || '',
               imageUrl: item.imageUrl || '',
               metadata: item
             });
             await node.save();
             inserted++;
          }
          return res.json({ message: `JSON processed. Imported ${inserted} records.` });
        } catch(e) {
          return res.status(400).json({ error: 'Invalid JSON format' });
        }
      });
    } else {
        return res.status(400).json({ error: 'Unsupported file type.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

module.exports = router;
