const connection = require('../config/db'); // Assuming db.js is in the same directory and exports the connection instance

const createSearch = async (keyword, found) => {
    const query = 'INSERT INTO searches (keyword, found) VALUES (?, ?)';
    const [result] = await connection.execute(query, [keyword, found]);
    return result.insertId;
};

const getSearchById = async (search_id) => {
    const query = 'SELECT * FROM searches WHERE search_id = ?';
    const [rows] = await connection.execute(query, [search_id]);
    return rows[0];
};

const getAllSearches = async (limit, offset) => {
    const query = 'SELECT * FROM searches LIMIT ? OFFSET ?';
    const [rows] = await connection.execute(query, [limit, offset]);
    return rows;
};

const getFilteredSearches = async (keyword, found, limit, offset) => {
    let query = 'SELECT * FROM searches WHERE 1=1';
    const params = [];
    
    if (keyword) {
        query += ' AND keyword LIKE ?';
        params.push(`%${keyword}%`);
    }

    if (typeof found !== 'undefined') {
        query += ' AND found = ?';
        params.push(found);
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await connection.execute(query, params);
    return rows;
};

const updateSearch = async (search_id, found) => {
    const query = 'UPDATE searches SET found = ? WHERE search_id = ?';
    const [result] = await connection.execute(query, [found, search_id]);
    return result.affectedRows;
};

module.exports = {
    createSearch,
    getSearchById,
    getAllSearches,
    getFilteredSearches,
    updateSearch
};
