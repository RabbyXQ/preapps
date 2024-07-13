const express = require('express');
const router = express.Router();
const searchesController = require('../controllers/SearchController'); // Adjust the path as necessary

// Create a new search
router.post('/searches', searchesController.createSearch);

// Get a search by ID
router.get('/searches/:id', searchesController.getSearchById);

// Get filtered searches with pagination
router.get('/searches', searchesController.getFilteredSearches);

// Update a search
router.put('/searches/:id', searchesController.updateSearch);

module.exports = router;
