const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const multer = require('multer');
const path = require('path');

// Define storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';
    if (file.fieldname === 'cat_thumb') {
      folder = 'public/uploads/cat_thumbs';
    } else if (file.fieldname === 'cover') {
      folder = 'public/uploads/cat_covers';
    } else if (file.fieldname === 'icon') {
      folder = 'public/uploads/cat_icons';
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

const upload = multer({ storage, fileFilter });

// Create category
router.post('/categories', upload.fields([
  { name: 'cat_thumb', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), CategoryController.createCategory);

// Get all categories
router.get('/categories', CategoryController.getCategories);

// Get a category by ID
router.get('/categories/:cat_id', CategoryController.getCategoryById);
router.get('/categories/name/:cat_name', CategoryController.getCategoryByName);
// Update a category
router.put('/categories/:cat_id', upload.fields([
  { name: 'cat_thumb', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), CategoryController.updateCategory);

// Delete a category
router.delete('/categories/:cat_id', CategoryController.deleteCategory);

module.exports = router;
