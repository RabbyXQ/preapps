const express = require('express');
const router = express.Router();
const SoftUploadController = require('../controllers/SoftUploadController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based

    // Build directory path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', year.toString(), month);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a new upload
router.post('/uploads', upload.single('file'), SoftUploadController.createUpload);

// Get all uploads
router.get('/uploads', SoftUploadController.getUploadsFiltered);

// Get an upload by ID
router.get('/uploads/:upload_id', SoftUploadController.getUploadById);

// Get uploads by software ID
router.get('/uploads/software/:software_id', SoftUploadController.getUploadsBySoftwareId);

// Update an upload
router.put('/uploads/:upload_id', upload.single('file'), SoftUploadController.updateUpload);

// Delete an upload
router.delete('/uploads/:upload_id', SoftUploadController.deleteUpload);

module.exports = router;
