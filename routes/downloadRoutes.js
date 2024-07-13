const express = require('express');
const router = express.Router();
const DownloadsController = require('../controllers/DownloadController');

// Get base URL dynamically
const getBaseUrl = (req) => {
  const protocol = req.protocol; // 'http' or 'https'
  const host = req.get('host');  // e.g., 'example.com'
  return `${protocol}://${host}/`; // Ensure this matches the file serving path
};

// Middleware to handle redirect and update download count
const handleDownloadRequest = async (req, res) => {
  const { upload_id } = req.params;
  
  try {
    // Get the path of the upload
    const path = await DownloadsController.getUploadPathById(Number(upload_id));
    
    if (!path) {
      return res.status(404).json({ error: 'Upload path not found' });
    }
    
    // Get software_id associated with the upload_id
    const software_id = await DownloadsController.softwareIdByUploadId(Number(upload_id));
    
    if (!software_id) {
      return res.status(404).json({ error: 'Software not found for the given upload' });
    }

    // Update download count
    const affectedRows = await DownloadsController.updateDownloadCount(Number(software_id));

    if (affectedRows > 0) {
    
      // Get base URL from request
      const baseUrl = getBaseUrl(req);

      // Concatenate base URL with the path
      const fullUrl = baseUrl + path;

      // Redirect to the full URL
      res.redirect(fullUrl);
    } else {
      res.status(404).json({ error: 'Download count update failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Route to handle download redirection
router.get('/download/:upload_id', handleDownloadRequest);

module.exports = router;
