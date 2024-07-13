const db = require('../config/db');

const createSoftware = async (software) => {
  const { platform_id, cat_id, package_name, name, icon, description, vendor, release_date } = software;

  const [result] = await db.query(
    'INSERT INTO software (platform_id, cat_id, package_name, name, icon, description, vendor, release_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [platform_id, cat_id, package_name, name, icon, description, vendor, release_date]
  );
  return result.insertId;
};

const getSoftwares = async ({ limit, offset }) => {
  const [countRows] = await db.query('SELECT COUNT(*) AS totalCount FROM software');
  const totalCount = countRows[0].totalCount;

  const [softwareRows] = await db.query(
    'SELECT * FROM software LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return { totalCount, softwares: softwareRows };
};

const getSoftwareById = async (id) => {
  const [rows] = await db.query('SELECT * FROM software WHERE software_id = ?', [id]);
  return rows[0];
};

const getSoftwareByPackageName = async (package_name) => {
  const [rows] = await db.query('SELECT * FROM software WHERE package_name = ?', [package_name]);
  return rows[0];
};

const getSoftwareByFilters = async (filters) => {
  const { platform_id, cat_id, package_name, name, vendor, release_date, page = 1, limit = 20 } = filters;

  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM software WHERE 1=1';
  let queryParams = [];

  if (platform_id) {
    query += ' AND platform_id = ?';
    queryParams.push(platform_id);
  }
  if (cat_id) {
    query += ' AND cat_id = ?';
    queryParams.push(cat_id);
  }
  if (package_name) {
    query += ' AND package_name = ?';
    queryParams.push(package_name);
  }
  if (name) {
    query += ' AND name LIKE ?';
    queryParams.push(`%${name}%`);
  }
  if (vendor) {
    query += ' AND vendor LIKE ?';
    queryParams.push(`%${vendor}%`);
  }
  if (release_date) {
    query += ' AND release_date = ?';
    queryParams.push(release_date);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  try {
    const [rows] = await db.query(query, queryParams);

    let countQuery = 'SELECT COUNT(*) AS totalCount FROM software WHERE 1=1';
    let countParams = [];

    if (platform_id) {
      countQuery += ' AND platform_id = ?';
      countParams.push(platform_id);
    }
    if (cat_id) {
      countQuery += ' AND cat_id = ?';
      countParams.push(cat_id);
    }
    if (package_name) {
      countQuery += ' AND package_name = ?';
      countParams.push(package_name);
    }
    if (name) {
      countQuery += ' AND name LIKE ?';
      countParams.push(`%${name}%`);
    }
    if (vendor) {
      countQuery += ' AND vendor = ?';
      countParams.push(vendor);
    }
    if (release_date) {
      countQuery += ' AND release_date = ?';
      countParams.push(release_date);
    }

    const [countRows] = await db.query(countQuery, countParams);
    const totalCount = countRows[0].totalCount;

    return { totalCount, softwares: rows };
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

const updateSoftware = async (id, software) => {
  const { platform_id, cat_id, package_name, name, icon, description, vendor, release_date } = software;

  // Start building the SQL query
  let sql = 'UPDATE software SET platform_id = ?, cat_id = ?, package_name = ?, name = ?, description = ?, vendor = ?, release_date = ?';
  const params = [platform_id, cat_id, package_name, name, description, vendor, release_date];

  // Add the icon field only if it's provided
  if (icon !== undefined) {
    sql += ', icon = ?'; // Ensure there's a space before this
    params.push(icon);
  }

  sql += ' WHERE software_id = ?'; // Added a space before WHERE
  params.push(id);

  try {
    // Execute the query
    const [result] = await db.query(sql, params);
    return result;
  } catch (error) {
    throw new Error(`Failed to update software: ${error.message}`);
  }
};

const deleteSoftware = async (id) => {
  await db.query('DELETE FROM software WHERE software_id = ?', [id]);
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
