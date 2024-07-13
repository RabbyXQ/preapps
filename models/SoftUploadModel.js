const db = require('../config/db');

// Create a new upload
const createUpload = async (upload) => {
  const { upload_date, path, version, format, requirement, architecture, feature, software_id } = upload;
  
  const [result] = await db.query(
    'INSERT INTO upload (upload_date, path, version, format, requirement, architecture, feature, software_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [upload_date, path, version, format, requirement, architecture, feature, software_id]
  );
  
  return result.insertId;
};

// Get all uploads
const getUploads = async () => {
  const [rows] = await db.query('SELECT * FROM upload');
  return rows;
};

// Get an upload by ID
const getUploadById = async (id) => {
  const [rows] = await db.query('SELECT * FROM upload WHERE upload_id = ?', [id]);
  return rows[0];
};

// Get uploads by software ID
const getUploadsBySoftwareId = async (software_id) => {
  const [rows] = await db.query('SELECT * FROM upload WHERE software_id = ?', [software_id]);
  return rows;
};

// Get uploads with optional filtering
const getUploadsFiltered = async (filters) => {
  let query = 'SELECT * FROM upload WHERE 1=1';
  const queryParams = [];

  if (filters.startDate) {
    query += ' AND upload_date >= ?';
    queryParams.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ' AND upload_date <= ?';
    queryParams.push(filters.endDate);
  }
  if (filters.version) {
    query += ' AND version = ?';
    queryParams.push(filters.version);
  }
  if (filters.format) {
    query += ' AND format = ?';
    queryParams.push(filters.format);
  }
  if (filters.requirement) {
    query += ' AND requirement = ?';
    queryParams.push(filters.requirement);
  }
  if (filters.architecture) {
    query += ' AND architecture = ?';
    queryParams.push(filters.architecture);
  }
  if (filters.feature) {
    query += ' AND feature = ?';
    queryParams.push(filters.feature);
  }
  if (filters.software_id) {
    query += ' AND software_id = ?';
    queryParams.push(filters.software_id);
  }

  const [rows] = await db.query(query, queryParams);
  return rows;
};

// Update an upload
const updateUpload = async (id, upload) => {
  const { upload_date, path, version, format, requirement, software_id } = upload;
  
  const [result] = await db.query(
    'UPDATE upload SET upload_date = ?, path = ?, version = ?, software_id = ? WHERE upload_id = ?',
    [upload_date, path, version, format, requirement, software_id, id]
  );
  
  return result.affectedRows;
};

// Delete an upload
const deleteUpload = async (id) => {
  const [result] = await db.query('DELETE FROM upload WHERE upload_id = ?', [id]);
  return result.affectedRows;
};

module.exports = {
  createUpload,
  getUploads,
  getUploadById,
  getUploadsBySoftwareId,
  getUploadsFiltered,
  updateUpload,
  deleteUpload
};
