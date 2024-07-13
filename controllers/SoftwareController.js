const SoftwareModel = require('../models/SoftwareModel');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const axios = require('axios');
const crypto = require('crypto');

// Utility function to ensure the directory exists
const ensureDirectoryExistence = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getFileExtensionFromUrl = (url) => {
  return path.extname(new URL(url).pathname);
};

const uploadIconByUrl = async (icon_url) => {
  if (!icon_url) {
    throw new Error('Icon URL is required');
  }

  try {
    // Generate a safe filename
    const safeFilename = crypto.randomBytes(16).toString('hex');

    // Initial attempt to get the file extension from the provided URL
    let iconExtension = getFileExtensionFromUrl(icon_url);

    // Follow redirects and get the final URL to determine the file extension if needed
    const response = await axios({
      url: icon_url,
      method: 'GET',
      responseType: 'stream',
      maxRedirects: 5  // Limit the number of redirects to avoid infinite loops
    });

    // If no file extension is found from the initial URL, get it from the redirected URL
    if (!iconExtension) {
      iconExtension = getFileExtensionFromUrl(response.request.res.responseUrl);
    }
    
    // Default to .tmp if the extension could not be determined
    iconExtension = iconExtension || '.jpg';

    const iconFilename = `${safeFilename}${iconExtension}`;
    const now = moment();
    const year = now.format('YYYY');
    const month = now.format('MM');
    const iconDirectory = path.join(process.cwd(), 'public', 'uploads', 'icons', year, month);
    const iconPath = path.join(iconDirectory, iconFilename);

    ensureDirectoryExistence(iconPath);

 

    // Pipe response data to file
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(iconPath);
      response.data.pipe(fileStream);

      fileStream.on('finish', () => {
        resolve(path.join('uploads', 'icons', year, month, iconFilename));
      });

      fileStream.on('error', (err) => {
        reject(new Error('Failed to save downloaded icon'));
      });
    });
  } catch (error) {
    throw new Error(`Error downloading icon: ${error.message}`);
  }
};

// Function to upload icon by file
const uploadIconByFile = async (icon) => {
  const now = moment();
  const year = now.format('YYYY');
  const month = now.format('MM');
  const iconDirectory = path.join(process.cwd(), 'public', 'uploads', 'icons', year, month);
  const iconFilename = `${now.valueOf()}_${icon.originalname}`;
  const iconPath = path.join(iconDirectory, iconFilename);

  ensureDirectoryExistence(iconPath);
  fs.renameSync(icon.path, iconPath);

  return path.join('uploads', 'icons', year, month, iconFilename);
};

const createSoftware = async (req, res) => {
  const software = req.body;
  const icon = req.file;

  try {
    if (icon && !req.body.icon_url) {
      // Upload icon by file
      software.icon = await uploadIconByFile(icon);
    } else if (!icon && req.body.icon_url) {
      // Upload icon by URL
      software.icon = await uploadIconByUrl(req.body.icon_url);
    } else {
      // No icon provided
      software.icon = null;
    }

    const softwareId = await SoftwareModel.createSoftware(software);
    res.status(201).json({ message: 'Software created successfully', softwareId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSoftwares = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  try {
    const { totalCount, softwares } = await SoftwareModel.getSoftwares({ limit: Number(limit), offset: Number(offset) });
    res.json({ totalCount, softwares });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSoftwareById = async (req, res) => {
  const software_id = parseInt(req.params.software_id, 10); // Ensure the ID is a number
  if (isNaN(software_id)) {
    return res.status(400).json({ error: 'Invalid software ID' });
  }

  try {
    const software = await SoftwareModel.getSoftwareById(software_id);
    if (software) {
      res.json(software);
    } else {
      res.status(404).json({ error: 'Software not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSoftwareByPackageName = async (req, res) => {
  const { package_name } = req.params;

  try {
    const software = await SoftwareModel.getSoftwareByPackageName(package_name);
    if (software) {
      res.json(software);
    } else {
      res.status(404).json({ error: 'Software not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSoftwareByFilters = async (req, res) => {
  const { platform_id, cat_id, package_name, name, vendor, release_date, page = 1, limit = 20 } = req.query;

  const filters = {
    platform_id,
    cat_id,
    name,
    vendor,
    release_date,
    page: Number(page),
    limit: Number(limit)
  };

  try {
    const softwareList = await SoftwareModel.getSoftwareByFilters(filters);
    res.json(softwareList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateSoftware = async (req, res) => {
  const { software_id } = req.params;
  const software = req.body;
  const icon = req.file;

  const id = Number(software_id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid software ID' });
  }

  try {
    const existingSoftware = await SoftwareModel.getSoftwareById(id);
    if (!existingSoftware) {
      return res.status(404).json({ error: 'Software not found' });
    }

    // Helper function to delete existing icon
    const deleteExistingIcon = async () => {
      if (existingSoftware.icon) {
        const oldIconPath = path.join(process.cwd(), 'public', existingSoftware.icon);
        try {
          await fs.promises.unlink(oldIconPath);
        } catch (err) {
          console.error('Error deleting old icon:', err);
        }
      }
    };

    if (icon) {
      // Delete old icon and upload new one from file
      await deleteExistingIcon();
      software.icon = await uploadIconByFile(icon);
    } else if (req.body.icon_url) {
      // Delete old icon and upload new one from URL
      await deleteExistingIcon();
      software.icon = await uploadIconByUrl(req.body.icon_url);
    } else {
      // Keep existing icon if no new icon provided
      software.icon = existingSoftware.icon;
    }

    const updateResult = await SoftwareModel.updateSoftware(id, software);
    if (updateResult.affectedRows > 0) {
      res.json({ message: 'Software updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update software' });
    }
  } catch (error) {
    console.error('Error updating software:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSoftware = async (req, res) => {
  const { software_id } = req.params;
  const id = Number(software_id);

  try {
    const software = await SoftwareModel.getSoftwareById(id);
    if (!software) {
      return res.status(404).json({ error: 'Software not found' });
    }

    if (software.icon) {
      const iconPath = path.join(process.cwd(), 'public', software.icon);
      try {
        await fs.promises.unlink(iconPath);
      } catch (err) {
        console.error('Error deleting icon:', err);
      }
    }

    await SoftwareModel.deleteSoftware(id);
    res.json({ message: 'Software deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSoftware,
  getSoftwares,
  getSoftwareById,
  getSoftwareByPackageName,
  getSoftwareByFilters,
  updateSoftware,
  deleteSoftware,
};
