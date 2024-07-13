const fs = require('fs');
const path = require('path');
const CategoryModel = require('../models/CategoryModel');

// Define directories for different file types
const CAT_THUMB_DIR = path.join(process.cwd(), 'public', 'uploads', 'cat_thumbs');
const CAT_COVER_DIR = path.join(process.cwd(), 'public', 'uploads', 'cat_covers');
const CAT_ICON_DIR = path.join(process.cwd(), 'public', 'uploads', 'cat_icons');

// Ensure directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExists(CAT_THUMB_DIR);
ensureDirectoryExists(CAT_COVER_DIR);
ensureDirectoryExists(CAT_ICON_DIR);

// Helper function to delete a file
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  }
};

// Function to check if a file is an image
const isImage = (file) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return file && validMimeTypes.includes(file.mimetype);
};

// Create a new category
const createCategory = async (req, res) => {
  const { type, platform_id, cat_name, cat_description } = req.body;
  const iconFile = req.files?.icon?.[0];
  const catThumbFile = req.files?.cat_thumb?.[0];
  const coverFile = req.files?.cover?.[0];

  const icon = iconFile && isImage(iconFile) ? `uploads/cat_icons/${iconFile.filename}` : null;
  const cat_thumb = catThumbFile && isImage(catThumbFile) ? `uploads/cat_thumbs/${catThumbFile.filename}` : null;
  const cover = coverFile && isImage(coverFile) ? `uploads/cat_covers/${coverFile.filename}` : null;

  console.log('Icon Path:', icon); // Debugging line
  console.log('Cat Thumb Path:', cat_thumb); // Debugging line
  console.log('Cover Path:', cover); // Debugging line

  try {
    const categoryId = await CategoryModel.createCategory({
      type,
      platform_id,
      cat_name,
      cat_description,
      icon,
      cat_thumb,
      cover
    });
    res.status(201).json({ message: 'Category created successfully', cat_id: categoryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a category by ID
const getCategoryById = async (req, res) => {
  const { cat_id } = req.params;
  try {
    const category = await CategoryModel.getCategoryById(cat_id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryByName = async (req, res) => {
  const { cat_name } = req.params;
  try {
    const category = await CategoryModel.getCatByName(cat_name);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update a category
const updateCategory = async (req, res) => {
  const { cat_id } = req.params;
  const { type, platform_id, cat_name, cat_description } = req.body;
  const iconFile = req.files?.icon?.[0];
  const catThumbFile = req.files?.cat_thumb?.[0];
  const coverFile = req.files?.cover?.[0];

  // Validate image files
  if (iconFile && !isImage(iconFile)) {
    return res.status(400).json({ error: 'Invalid icon file format' });
  }
  if (catThumbFile && !isImage(catThumbFile)) {
    return res.status(400).json({ error: 'Invalid category thumbnail file format' });
  }
  if (coverFile && !isImage(coverFile)) {
    return res.status(400).json({ error: 'Invalid cover file format' });
  }

  const icon = iconFile && isImage(iconFile) ? `uploads/cat_icons/${iconFile.filename}` : null;
  const cat_thumb = catThumbFile && isImage(catThumbFile) ? `uploads/cat_thumbs/${catThumbFile.filename}` : null;
  const cover = coverFile && isImage(coverFile) ? `uploads/cat_covers/${coverFile.filename}` : null;

  console.log('Update Icon Path:', icon); // Debugging line
  console.log('Update Cat Thumb Path:', cat_thumb); // Debugging line
  console.log('Update Cover Path:', cover); // Debugging line

  try {
    const existingCategory = await CategoryModel.getCategoryById(cat_id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete existing files if they exist
    if (existingCategory.icon && icon) {
      deleteFile(existingCategory.icon);
    }
    if (existingCategory.cat_thumb && cat_thumb) {
      deleteFile(existingCategory.cat_thumb);
    }
    if (existingCategory.cover && cover) {
      deleteFile(existingCategory.cover);
    }

    // Update category in the database
    await CategoryModel.updateCategory(cat_id, {
      type,
      platform_id,
      cat_name,
      cat_description,
      icon,
      cat_thumb,
      cover
    });
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { cat_id } = req.params;
  try {
    const category = await CategoryModel.getCategoryById(cat_id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete associated files
    deleteFile(category.icon);
    deleteFile(category.cat_thumb);
    deleteFile(category.cover);

    // Delete category from the database
    await CategoryModel.deleteCategory(cat_id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, getCategoryByName};
