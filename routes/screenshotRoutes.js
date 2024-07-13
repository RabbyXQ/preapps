const express = require('express');
const router = express.Router();
const screenshotController = require('../controllers/ScreenshotController');
const multer = require('multer');
const path = require('path');

// Configure multer to handle image file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the directory structure based on the current date
        const now = new Date();
        const year = now.getFullYear();
        const month = (`0${now.getMonth() + 1}`).slice(-2); // Zero-based month index
        const uploadPath = path.join('public', 'uploads', 'screenshots', year.toString(), month);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Save the file with a timestamp to ensure unique names
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10 MB
});

// Define routes for screenshot management
router.post('/', upload.single('file'), screenshotController.createScreenshot);
router.get('/single/:scr_id', screenshotController.getScreenshot);
router.get('/software/:software_id', screenshotController.getAllScreenshots);
router.put('/:scr_id', upload.single('file'), screenshotController.updateScreenshot);
router.delete('/:scr_id', screenshotController.deleteScreenshot);

module.exports = router;
