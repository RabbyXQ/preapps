const express = require('express');
const router = express.Router();
const SoftwareController = require('../controllers/SoftwareController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to create directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based

    const iconDirectory = path.join(process.cwd(), 'public', 'uploads', 'icons', year.toString(), month);
    createDirIfNotExists(iconDirectory);
    
    cb(null, iconDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Function to validate image files
const fileFilter = (req, file, cb) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (file.fieldname === 'icon' && validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format, only images are allowed for icon'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Create a new software
router.post('/softwares', upload.single('icon'), SoftwareController.createSoftware);

// Get all software
//router.get('/softwares', SoftwareController.getSoftwares);

// Get a software by ID
router.get('/softwares/:software_id', SoftwareController.getSoftwareById);

// Get a software by package name
router.get('/softwares/package/:package_name', SoftwareController.getSoftwareByPackageName);

// Get software by filters with pagination
router.get('/softwares', SoftwareController.getSoftwareByFilters);

// Update a software
router.put('/softwares/:software_id', upload.single('icon'), SoftwareController.updateSoftware);

// Delete a software
router.delete('/softwares/:software_id', SoftwareController.deleteSoftware);

module.exports = router;
