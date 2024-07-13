const db = require('../config/db'); // Import the database connection module
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import JWT for token generation
require('dotenv').config(); // Load environment variables from .env file

// Utility function to handle errors
const handleError = (message, error) => {
    throw new Error(`${message}: ${error.message}`);
  };
  
  // Hash the password
  const hashPassword = async (password) => {
    try {
      if (!password) {
        throw new Error('Password is required');
      }
      return await bcrypt.hash(password, 10); // Default salt rounds
    } catch (error) {
      handleError('Error hashing password', error);
    }
  };
  
  // Add a new user
  const addUser = async (username, passwd, email) => {
    try {
      if (!username || !passwd || !email) {
        throw new Error('Username, password, and email are required to add a user');
      }
      const hashedPassword = await hashPassword(passwd);
      return await db.query(
        'INSERT INTO admin (username, passwd, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email]
      );
    } catch (error) {
      handleError('Error adding user', error);
    }
  };
  
// Verify a user's password
const verifyUser = async (username, password) => {
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwd);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return user;
  } catch (error) {
    handleError('Error verifying user', error);
  }
};

// Generate JWT token
const generateToken = (user) => {
  try {
    const payload = { username: user.username };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Use JWT secret from environment variable
  } catch (error) {
    handleError('Error generating token', error);
  }
};


// Get all users
const getUsers = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM admin');
    return rows;
  } catch (error) {
    handleError('Error retrieving users', error);
  }
};

// Get a user by username
const getUser = async (username) => {
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
    return rows[0];
  } catch (error) {
    handleError('Error retrieving user', error);
  }
};

// Update a user
const updateUser = async (username, newPasswd = null, newEmail = null) => {
  try {
    const updates = [];
    const params = [];

    if (newPasswd) {
      params.push(await hashPassword(newPasswd));
      updates.push('passwd = ?');
    }
    
    if (newEmail) {
      params.push(newEmail);
      updates.push('email = ?');
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(username);
    const query = `UPDATE admin SET ${updates.join(', ')} WHERE username = ?`;
    return await db.query(query, params);
  } catch (error) {
    handleError('Error updating user', error);
  }
};

// Delete a user
const deleteUser = async (username) => {
  try {
    return await db.query('DELETE FROM admin WHERE username = ?', [username]);
  } catch (error) {
    handleError('Error deleting user', error);
  }
};

module.exports = { verifyUser, generateToken, addUser, getUsers, getUser, updateUser, deleteUser };
