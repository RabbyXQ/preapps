const db = require('../config/db'); // Your database connection

// Add a new platform
const createPlatform = async (platform) => {
  const { platform_name, description, thumbnail, cover, icon } = platform;
  
  if (!platform_name) {
    throw new Error('platform_name is required and cannot be null');
  }

  const [result] = await db.query(
    'INSERT INTO platform (platform_name, description, thumbnail, cover, icon) VALUES (?, ?, ?, ?, ?)',
    [platform_name, description, thumbnail, cover, icon]
  );
  return result.insertId;
};

// Get all platforms
const getPlatforms = async () => {
  const [rows] = await db.query('SELECT * FROM platform');
  return rows;
};

// Get a platform by ID
const getPlatformById = async (id) => {
  const [rows] = await db.query('SELECT * FROM platform WHERE platform_id = ?', [id]);
  return rows[0];
};

// Update a platform
const updatePlatform = async (id, platform) => {
  const { platform_name, description, thumbnail, cover, icon } = platform;

  // Start building the SQL query
  let sql = 'UPDATE platform SET platform_name = ?, description = ?';
  const params = [platform_name, description];

  // Add the optional fields if they are provided
  if (thumbnail !== null) {
    sql += ', thumbnail = ?';
    params.push(thumbnail);
  }
  if (cover !== null) {
    sql += ', cover = ?';
    params.push(cover);
  }
  if (icon !== null) {
    sql += ', icon = ?';
    params.push(icon);
  }

  // Add the WHERE clause
  sql += ' WHERE platform_id = ?';
  params.push(id);

  // Execute the query
  await db.query(sql, params);
};


// Delete a platform
const deletePlatform = async (id) => {
  await db.query('DELETE FROM platform WHERE platform_id = ?', [id]);
};

module.exports = {
  createPlatform,
  getPlatforms,
  getPlatformById,
  updatePlatform,
  deletePlatform
};
