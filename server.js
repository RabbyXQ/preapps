const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
const platformRoutes = require('./routes/platformRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const softwareRoutes = require('./routes/softwareRoutes');
const softUploadRoutes = require('./routes/softUploadRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const screenshotRoutes = require('./routes/screenshotRoutes');
const searchRoutes = require('./routes/searchRoutes'); // Adjust the path as necessary
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // For parsing application/json

// Use routes with /api prefix
app.use('/api', userRoutes);
app.use('/api', platformRoutes);
app.use('/api', categoryRoutes);
app.use('/api', softwareRoutes);
app.use('/api', softUploadRoutes);
app.use('/api', downloadRoutes);
app.use('/api/screenshots/', screenshotRoutes);
app.use('/api', searchRoutes); // Prefix all routes in searchesController with /api
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
