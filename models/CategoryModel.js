const db = require('../config/db'); // Your database connection

// Add a new category
const createCategory = async (category) => {
  const { type, platform_id, cat_name, cat_description, icon, cat_thumb, cover } = category;

  if (!cat_name) {
    throw new Error('cat_name is required and cannot be null');
  }

  const [result] = await db.query(
    'INSERT INTO category (type, platform_id, cat_name, cat_description, icon, cat_thumb, cover) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [type, platform_id, cat_name, cat_description, icon, cat_thumb, cover]
  );
  return result.insertId;
};

// Get all categories
const getCategories = async () => {
  const [rows] = await db.query('SELECT * FROM category');
  return rows;
};

// Get a category by ID
const getCategoryById = async (id) => {
  const [rows] = await db.query('SELECT * FROM category WHERE cat_id = ?', [id]);
  return rows[0];
};

const getCatByName = async (cat_name) => {
  try {
    const [rows] = await db.query('SELECT * FROM category WHERE cat_name LIKE ?', [`%${cat_name}%`]);
    if (rows.length > 0) {
      return rows[0]; // Return the first matching row
    } else {
      return null; // No rows found
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error; // Propagate the error for further handling
  }
};


// Update a category
const updateCategory = async (id, category) => {
  const { type, platform_id, cat_name, cat_description, icon, cat_thumb, cover } = category;

  // Start building the SQL query
  let sql = 'UPDATE category SET type = ?, platform_id = ?, cat_name = ?, cat_description = ?';
  const params = [type, platform_id, cat_name, cat_description];

  // Add the optional fields if they are provided
  if (icon !== null) {
    sql += ', icon = ?';
    params.push(icon);
  }
  if (cat_thumb !== null) {
    sql += ', cat_thumb = ?';
    params.push(cat_thumb);
  }
  if (cover !== null) {
    sql += ', cover = ?';
    params.push(cover);
  }

  // Add the WHERE clause
  sql += ' WHERE cat_id = ?';
  params.push(id);

  // Execute the query
  await db.query(sql, params);
};

// Delete a category
const deleteCategory = async (id) => {
  await db.query('DELETE FROM category WHERE cat_id = ?', [id]);
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCatByName
};
