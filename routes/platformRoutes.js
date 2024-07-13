const express = require('express');
const router = express.Router();
const PlatformController = require('../controllers/PlatformController');
const multer = require('multer');
const path = require('path');

// Define storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';
    if (file.fieldname === 'thumbnail') {
      folder = 'public/uploads/thumbnails';
    } else if (file.fieldname === 'cover') {
      folder = 'public/uploads/covers';
    } else if (file.fieldname === 'icon') {
      folder = 'public/uploads/icons';
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to ensure only image files are uploaded
const fileFilter = (req, file, cb) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format, only images are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter
});

// Create platform
router.post('/platforms', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), PlatformController.createPlatform);

// Get all platforms
router.get('/platforms', PlatformController.getPlatforms);

// Get a platform by ID
router.get('/platforms/:platform_id', PlatformController.getPlatformById);

// Update a platform
router.put('/platforms/:platform_id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), PlatformController.updatePlatform);

// Delete a platform
router.delete('/platforms/:platform_id', PlatformController.deletePlatform);

module.exports = router;
