const mongoose = require('mongoose');

const intelligenceNodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  sourceType: {
    type: String,
    enum: ['OSINT', 'HUMINT', 'IMINT'],
    required: true,
  },
  coordinates: {
    // Expected to be [longitude, latitude] to align with GeoJSON, 
    // or we can just specify a precise format. We'll use GeoJSON for geospatial queries if needed.
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    // coordinates array: [longitude, latitude]
    coordinates: {
      type: [Number],
      required: true
    }
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String, // Can be used for IMINT directly or other relevant attached media
  },
  metadata: {
    // Flexible object to store parsed CSV rows or additional extracted info
    type: mongoose.Schema.Types.Mixed, 
  }
}, { timestamps: true });

// Geolocation index for the maps
intelligenceNodeSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('IntelligenceNode', intelligenceNodeSchema);
