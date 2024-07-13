const searchesModel = require('../models/SearchModel'); // Adjust the path as necessary

const createSearch = async (req, res) => {
    const { keyword, found } = req.body;
    try {
        const search_id = await searchesModel.createSearch(keyword, found);
        res.status(201).json({ search_id });
    } catch (error) {
        console.error('Error creating search:', error);
        res.status(500).json({ error: 'An error occurred while creating the search' });
    }
};

const getSearchById = async (req, res) => {
    const { id } = req.params;
    try {
        const search = await searchesModel.getSearchById(id);
        if (search) {
            res.json(search);
        } else {
            res.status(404).json({ error: 'Search not found' });
        }
    } catch (error) {
        console.error('Error fetching search:', error);
        res.status(500).json({ error: 'An error occurred while fetching the search' });
    }
};

const getAllSearches = async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    try {
        const searches = await searchesModel.getAllSearches(Number(limit), Number(offset));
        res.json(searches);
    } catch (error) {
        console.error('Error fetching searches:', error);
        res.status(500).json({ error: 'An error occurred while fetching the searches' });
    }
};

const getFilteredSearches = async (req, res) => {
    const { keyword, found, limit = 10, offset = 0 } = req.query;
    try {
        const searches = await searchesModel.getFilteredSearches(keyword, found, Number(limit), Number(offset));
        res.json(searches);
    } catch (error) {
        console.error('Error fetching filtered searches:', error);
        res.status(500).json({ error: 'An error occurred while fetching the filtered searches' });
    }
};

const updateSearch = async (req, res) => {
    const { id } = req.params;
    const { found } = req.body;
    try {
        const affectedRows = await searchesModel.updateSearch(id, found);
        if (affectedRows > 0) {
            res.json({ message: 'Search updated successfully' });
        } else {
            res.status(404).json({ error: 'Search not found' });
        }
    } catch (error) {
        console.error('Error updating search:', error);
        res.status(500).json({ error: 'An error occurred while updating the search' });
    }
};

module.exports = {
    createSearch,
    getSearchById,
    getAllSearches,
    getFilteredSearches,
    updateSearch
};
