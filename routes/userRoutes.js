const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Login and get a token
router.post('/users/login', UserController.loginUser);

// Logout
router.post('/users/logout', authenticateToken, UserController.logoutUser);

// Register a new user (if needed)
router.post('/users/register', UserController.registerUser); // Ensure this method is defined in UserController

// Get all users (protected if needed)
router.get('/users', authenticateToken, UserController.getUsers);

// Get a user by username (protected if needed)
router.get('/users/:username', authenticateToken, UserController.getUser);

// Update a user (protected if needed)
router.put('/users/:username', authenticateToken, UserController.updateUser);

// Delete a user (protected if needed)
router.delete('/users/:username', authenticateToken, UserController.deleteUser);

module.exports = router;
