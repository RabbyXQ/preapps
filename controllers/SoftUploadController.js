const SoftUploadModel = require('../models/SoftUploadModel');
const SoftwareModel = require('../models/SoftwareModel');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../config/db'); // Import db for use in getUploadsFiltered

// Helper function to generate file name
const generateFileName = (package_name, version, originalName) => {
  const timestamp = Date.now();
  const fileExtension = path.extname(originalName);
  return `${package_name}_${version}_${timestamp}${fileExtension}`;
};

// Helper function to create directory if it doesn't exist
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

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

// Utility function to upload file from URL

// Helper function to get the file extension from URL
const getFileExtensionFromUrl = (url) => {
  return path.extname(new URL(url).pathname);
};

// Main function to upload file by URL
const uploadFileByUrl = async (file_url, package_name, version) => {
  if (!file_url) {
    throw new Error('File URL is required');
  }

  try {
    const timestamp = Date.now();
    
    // Initial attempt to get the file extension from the provided URL
    let fileExtension = getFileExtensionFromUrl(file_url);

    // Follow redirects and get the final URL to determine the file extension if needed
    const response = await axios({
      url: file_url,
      method: 'GET',
      responseType: 'stream',
      maxRedirects: 5  // Limit the number of redirects to avoid infinite loops
    });

    // If no file extension is found from the initial URL, get it from the redirected URL
    if (!fileExtension) {
      fileExtension = getFileExtensionFromUrl(response.request.res.responseUrl);
    }
    
    // Default to .tmp if the extension could not be determined
    fileExtension = fileExtension || '.tmp';
    
    const safeFilename = `${package_name}_${version}_${timestamp}${fileExtension}`;
    const now = new Date();
    const year = now.getFullYear();
    const month = (`0${now.getMonth() + 1}`).slice(-2); // Months are zero-based
    const fileDirectory = path.join(process.cwd(), 'public', 'uploads', year.toString(), month, package_name);
    const filePath = path.join(fileDirectory, safeFilename);

    createDirectory(fileDirectory);

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      response.data.pipe(fileStream);

      fileStream.on('finish', () => {
        resolve(path.join('uploads', year.toString(), month, package_name, safeFilename));
      });

      fileStream.on('error', (err) => {
        reject(new Error('Failed to save downloaded file'));
      });
    });
  } catch (error) {
    throw new Error(`Error downloading file: ${error.message}`);
  }
};

// Upload a file by form data
const uploadByFile = async (req, res) => {
  const { upload_date, version, software_id } = req.body;
  const file = req.file;

  try {
    const software = await SoftwareModel.getSoftwareById(Number(software_id)); // Convert to number
    if (!software) {
      return res.status(404).json({ error: 'Software not found' });
    }

    const { package_name } = software;
    const currentYear = new Date().getFullYear();
    const currentMonth = (`0${new Date().getMonth() + 1}`).slice(-2); // Months are zero-based

    if (file) {
      const newFileName = generateFileName(package_name, version, file.originalname);
      const dirPath = path.join('uploads', currentYear.toString(), currentMonth, package_name);
      const newPath = path.join(dirPath, newFileName);

      createDirectory(path.join(process.cwd(), 'public', dirPath));

      fs.renameSync(file.path, path.join(process.cwd(), 'public', newPath));

      return { filePath: newPath };
    } else {
      throw new Error('No file uploaded');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Create an upload by URL or form data
const createUpload = async (req, res) => {
  const { upload_date, version, software_id, file_url, format, requirement, architecture, feature } = req.body;
  const file = req.file;

  try {
    const software = await SoftwareModel.getSoftwareById(Number(software_id)); // Convert to number
    if (!software) {
      return res.status(404).json({ error: 'Software not found' });
    }

    const { package_name } = software;

    let filePath;

    if (file) {
      // Handle file upload using the uploadByFile function
      const result = await uploadByFile(req, res);
      filePath = result.filePath;
    } else if (file_url) {
      // Handle file URL
      filePath = await uploadFileByUrl(file_url, package_name, version);
    } else {
      return res.status(400).json({ error: 'No file or file URL provided' });
    }

    // Create the upload record in the database
    const uploadId = await SoftUploadModel.createUpload({
      upload_date,
      path: filePath,
      version,
      format,
      requirement,
      architecture,
      feature,
      software_id: Number(software_id) // Convert to number
    });

    res.status(201).json({ message: 'Upload created successfully', upload_id: uploadId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all uploads
const getUploads = async (req, res) => {
  try {
    const uploads = await SoftUploadModel.getUploads();
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an upload by ID
const getUploadById = async (req, res) => {
  const { upload_id } = req.params;
  try {
    const upload = await SoftUploadModel.getUploadById(Number(upload_id)); // Convert to number
    if (upload) {
      res.json(upload);
    } else {
      res.status(404).json({ error: 'Upload not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get uploads by software ID
const getUploadsBySoftwareId = async (req, res) => {
  const { software_id } = req.params;
  try {
    const uploads = await SoftUploadModel.getUploadsBySoftwareId(Number(software_id)); // Convert to number
    if (uploads.length > 0) {
      res.json(uploads);
    } else {
      res.status(404).json({ error: 'No uploads found for this software' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an upload
const updateUpload = async (req, res) => {
  const { upload_id } = req.params;
  const { upload_date, version, software_id, file_url, format, requirement, architecture, feature} = req.body;
  const newFile = req.file;
  
  try {
    // Get the existing upload record
    const existingUpload = await SoftUploadModel.getUploadById(Number(upload_id)); // Convert to number

    if (!existingUpload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Fetch the package name for the given software_id
    const software = await SoftwareModel.getSoftwareById(Number(software_id)); // Convert to number
    if (!software) {
      return res.status(404).json({ error: 'Software not found' });
    }

    const { package_name } = software;
    const currentYear = new Date().getFullYear();
    const currentMonth = (`0${new Date().getMonth() + 1}`).slice(-2); // Months are zero-based

    let newFilePath;

    if (newFile) {
      // Delete the existing file if a new file is provided
      deleteFile(existingUpload.path);

      // Handle new file upload using the uploadByFile function
      const result = await uploadByFile(req, res);
      newFilePath = result.filePath;
    } else if (file_url) {
      // Delete the existing file if a file URL is provided
      deleteFile(existingUpload.path);

      // Handle file URL
      newFilePath = await uploadFileByUrl(file_url, package_name, version);
    } else {
      // Keep the existing file path if no new file or URL is provided
      newFilePath = existingUpload.path;
    }

    // Update the upload record with the new file path
    const affectedRows = await SoftUploadModel.updateUpload(Number(upload_id), {
      upload_date,
      path: newFilePath,
      version,
      format,
      requirement,
      architecture,
      feature,
      software_id: Number(software_id) // Convert to number
    });
    
    if (affectedRows > 0) {
      res.json({ message: 'Upload updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update upload' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an upload
const deleteUpload = async (req, res) => {
  const { upload_id } = req.params;
  try {
    const upload = await SoftUploadModel.getUploadById(Number(upload_id)); // Convert to number
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete the associated file
    deleteFile(upload.path);

    // Delete the upload record from the database
    await SoftUploadModel.deleteUpload(Number(upload_id)); // Convert to number
    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get uploads with filters
const getUploadsFiltered = async (req, res) => {
  const filters = req.query || {}; // Ensure filters object is defined

  // Log filters for debugging
  console.log('Received filters:', filters);

  try {
    // Use destructuring with default values to handle missing properties
    const {
      startDate = undefined,
      endDate = undefined,
      version = undefined,
      software_id
    } = filters;

    // Convert software_id to a number if present
    const numericSoftwareId = software_id ? Number(software_id) : undefined;

    // Call the model method with the filtered parameters
    const uploads = await SoftUploadModel.getUploadsFiltered({
      startDate,
      endDate,
      version,
      software_id: numericSoftwareId
    });

    res.json(uploads);
  } catch (error) {
    console.error('Error fetching filtered uploads:', error);
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  createUpload,
  getUploads,
  getUploadById,
  getUploadsBySoftwareId,
  updateUpload,
  deleteUpload,
  getUploadsFiltered
};
