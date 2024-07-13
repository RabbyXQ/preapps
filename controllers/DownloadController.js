const db = require('../config/db'); 


const getUploadPathById = async (upload_id) => {
  const [rows] = await db.query('SELECT path FROM upload WHERE upload_id = ?', [upload_id]);
  return rows[0] ? rows[0].path : null;
};

// Get the software ID associated with the given upload ID
const softwareIdByUploadId = async (upload_id) => {
  const [rows] = await db.query('SELECT software_id FROM upload WHERE upload_id = ?', [upload_id]);
  return rows[0] ? rows[0].software_id : null;
};

// Update the download count for a given software ID
const updateDownloadCount = async (software_id) => {
  const [result] = await db.query(
    'UPDATE software SET downloads = downloads + 1 WHERE software_id = ?',
    [software_id]
  );
  return result.affectedRows;
};



module.exports = {
  getUploadPathById,
  softwareIdByUploadId,
  updateDownloadCount
};
