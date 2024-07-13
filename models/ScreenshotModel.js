const connection = require('../config/db'); // adjust the path as necessary


const insertScreenshot = async (link, software_id) => {
    const query = 'INSERT INTO soft_screenshot (link, software_id) VALUES (?, ?)';
    const [result] = await connection.execute(query, [link, software_id]);
    return result.insertId;
};

const getScreenshotById = async (scr_id) => {
    const query = 'SELECT * FROM soft_screenshot WHERE scr_id = ?';
    const [rows] = await connection.execute(query, [scr_id]);
    return rows[0];
};

const getAllScreenshots = async (software_id) => {
    const query = 'SELECT * FROM soft_screenshot WHERE software_id = ?';
    const [rows] = await connection.execute(query, [software_id]);
    return rows;
};

const updateScreenshot = async (scr_id, link) => {
    const query = 'UPDATE soft_screenshot SET link = ? WHERE scr_id = ?';
    await connection.execute(query, [link, scr_id]);
};

const deleteScreenshot = async (scr_id) => {
    const query = 'DELETE FROM soft_screenshot WHERE scr_id = ?';
    await connection.execute(query, [scr_id]);
};

module.exports = {
    insertScreenshot,
    getScreenshotById,
    getAllScreenshots,
    updateScreenshot,
    deleteScreenshot
};
