const fs = require('fs');
const path = require('path');
const PlatformModel = require('../models/PlatformModel');

// Define directories for different file types
const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
const COVER_DIR = path.join(process.cwd(), 'public', 'uploads', 'covers');
const ICON_DIR = path.join(process.cwd(), 'public', 'uploads', 'icons');

// Ensure directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExists(THUMBNAIL_DIR);
ensureDirectoryExists(COVER_DIR);
ensureDirectoryExists(ICON_DIR);

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

// Create a new platform
const createPlatform = async (req, res) => {
  const { platform_name, description } = req.body;
  const thumbnailFile = req.files?.thumbnail?.[0];
  const coverFile = req.files?.cover?.[0];
  const iconFile = req.files?.icon?.[0];

  const thumbnail = thumbnailFile ? `uploads/thumbnails/${thumbnailFile.filename}` : null;
  const cover = coverFile ? `uploads/covers/${coverFile.filename}` : null;
  const icon = iconFile ? `uploads/icons/${iconFile.filename}` : null;

  try {
    const platformId = await PlatformModel.createPlatform({
      platform_name,
      description,
      thumbnail,
      cover,
      icon,
    });
    res.status(201).json({ message: 'Platform created successfully', platform_id: platformId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all platforms
const getPlatforms = async (req, res) => {
  try {
    const platforms = await PlatformModel.getPlatforms();
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a platform by ID
const getPlatformById = async (req, res) => {
  const { platform_id } = req.params;
  try {
    const platform = await PlatformModel.getPlatformById(platform_id);
    if (platform) {
      res.json(platform);
    } else {
      res.status(404).json({ error: 'Platform not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a platform
const updatePlatform = async (req, res) => {
  const { platform_id } = req.params;
  const { platform_name, description } = req.body;
  const thumbnailFile = req.files?.thumbnail?.[0];
  const coverFile = req.files?.cover?.[0];
  const iconFile = req.files?.icon?.[0];

  const thumbnail = thumbnailFile ? `uploads/thumbnails/${thumbnailFile.filename}` : null;
  const cover = coverFile ? `uploads/covers/${coverFile.filename}` : null;
  const icon = iconFile ? `uploads/icons/${iconFile.filename}` : null;

  try {
    const existingPlatform = await PlatformModel.getPlatformById(platform_id);
    if (!existingPlatform) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    // Delete existing files if they exist
    if (existingPlatform.thumbnail && thumbnail) {
      deleteFile(existingPlatform.thumbnail);
    }
    if (existingPlatform.cover && cover) {
      deleteFile(existingPlatform.cover);
    }
    if (existingPlatform.icon && icon) {
      deleteFile(existingPlatform.icon);
    }

    // Update platform in the database
    await PlatformModel.updatePlatform(platform_id, {
      platform_name,
      description,
      thumbnail,
      cover,
      icon,
    });
    res.json({ message: 'Platform updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a platform
const deletePlatform = async (req, res) => {
  const { platform_id } = req.params;
  try {
    const platform = await PlatformModel.getPlatformById(platform_id);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    // Delete associated files
    deleteFile(platform.thumbnail);
    deleteFile(platform.cover);
    deleteFile(platform.icon);

    // Delete platform from the database
    await PlatformModel.deletePlatform(platform_id);
    res.json({ message: 'Platform deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPlatform, getPlatforms, getPlatformById, updatePlatform, deletePlatform };
