const UserModel = require('../models/UserModel');
const { blacklist } = require('../middlewares/authMiddleware');

// Handle user login
const loginUser = async (req, res) => {
  const { username, passwd } = req.body;
  try {
    const user = await UserModel.verifyUser(username, passwd);
    const token = UserModel.generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(401).send(error.message);
  }
};

// Handle user logout
const logoutUser = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    blacklist.add(token); // Add token to blacklist
  }

  res.status(200).send('Logged out successfully');
};

// Handle user registration
const registerUser = async (req, res) => {
  const { username, passwd, email } = req.body;
  try {
    // Validate input
    if (!username || !passwd || !email) {
      return res.status(400).send('Username, password, and email are required');
    }

    // Check if the username already exists
    const existingUser = await UserModel.getUser(username);
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    // Add new user
    await UserModel.addUser(username, passwd, email);
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get a user by username
const getUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await UserModel.getUser(username);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { username } = req.params;
  const { newPasswd, newEmail } = req.body;
  try {
    await UserModel.updateUser(username, newPasswd, newEmail);
    res.send('User updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { username } = req.params;
  try {
    await UserModel.deleteUser(username);
    res.send('User deleted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { loginUser, logoutUser, registerUser, getUsers, getUser, updateUser, deleteUser };
