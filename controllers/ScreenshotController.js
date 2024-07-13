const screenshotModel = require('../models/ScreenshotModel');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const axios = require('axios');
const crypto = require('crypto');

// Utility function to ensure the directory exists
const ensureDirectoryExistence = (filePath) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};


const uploadScreenshotByUrl = async (url) => {
    if (!url) {
        throw new Error('URL is required');
    }

    try {
        const safeFilename = crypto.randomBytes(16).toString('hex');
        let fileExtension = path.extname(url) || '.tmp';
        const filename = `${safeFilename}${fileExtension}`;
        const now = moment();
        const year = now.format('YYYY');
        const month = now.format('MM');
        const directory = path.join(process.cwd(), 'public', 'uploads', 'screenshots', year, month);
        const filePath = path.join(directory, filename);

        ensureDirectoryExistence(filePath);

        // Fetch the final URL after possible redirects
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            maxRedirects: 10 // Follow redirects if any
        });

        if (response.status !== 200) {
            throw new Error('Failed to download file');
        }

        // If extension not in URL, determine it from the content type or buffer
        if (!path.extname(url)) {
            const contentType = response.headers['content-type'];
            if (contentType) {
                const mimeTypeToExtension = {
                    'image/jpeg': '.jpg',
                    'image/png': '.png',
                    'image/gif': '.gif'
                };
                fileExtension = mimeTypeToExtension[contentType] || '.tmp';
            } else {
                // Fallback to file-type library if content-type is not present
                const fileType = await fileTypeFromBuffer(response.data);
                if (fileType && fileType.ext) {
                    fileExtension = `.${fileType.ext}`;
                } else {
                    throw new Error('Unable to determine file extension');
                }
            }
        }

        const newFilename = `${safeFilename}${fileExtension}`;
        const newFilePath = path.join(directory, newFilename);

        // Save the file
        fs.writeFileSync(newFilePath, response.data);

        return path.join('uploads', 'screenshots', year, month, newFilename);
    } catch (error) {
        throw new Error(`Error downloading file: ${error.message}`);
    }
};


const uploadScreenshotByFile = async (file) => {
    // Check if the file is an image
    if (!file.mimetype.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    const now = moment();
    const year = now.format('YYYY');
    const month = now.format('MM');
    const directory = path.join(process.cwd(), 'public', 'uploads', 'screenshots', year, month);
    const safeFilename = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(file.originalname);
    const filename = `${safeFilename}${fileExtension}`;
    const filePath = path.join(directory, filename);

    ensureDirectoryExistence(filePath);
    fs.renameSync(file.path, filePath);

    return path.join('uploads', 'screenshots', year, month, filename);
};

const createScreenshot = async (req, res) => {
    const screenshot = req.body;
    const file = req.file;

    try {
        if (file && !req.body.url) {
            screenshot.link = await uploadScreenshotByFile(file);
        } else if (!file && req.body.url) {
            screenshot.link = await uploadScreenshotByUrl(req.body.url);
        } else {
            screenshot.link = null;
        }

        const scr_id = await screenshotModel.insertScreenshot(screenshot.link, screenshot.software_id);
        res.status(201).json({ message: 'Screenshot created successfully', scr_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getScreenshot = async (req, res) => {
    try {
        const { scr_id } = req.params;
        const screenshot = await screenshotModel.getScreenshotById(scr_id);
        if (screenshot) {
            res.status(200).json(screenshot);
        } else {
            res.status(404).json({ message: 'Screenshot not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllScreenshots = async (req, res) => {
    try {
        const { software_id } = req.params;
        if (!software_id) {
            return res.status(400).json({ error: 'software_id query parameter is required' });
        }
        const screenshots = await screenshotModel.getAllScreenshots(Number(software_id));
        res.status(200).json(screenshots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateScreenshot = async (req, res) => {
    const { scr_id } = req.params;
    const screenshot = req.body;
    const file = req.file;

    try {
        const oldScreenshot = await screenshotModel.getScreenshotById(scr_id);

        if (oldScreenshot) {
            if ((file||req.body.url) && oldScreenshot.link !== screenshot.link && oldScreenshot.link.startsWith('uploads/')) {
                const oldFilePath = path.join(process.cwd(), 'public', oldScreenshot.link);
                fs.unlinkSync(oldFilePath);
            }

            if (file) {
                screenshot.link = await uploadScreenshotByFile(file);
            } else if (req.body.url) {
                screenshot.link = await uploadScreenshotByUrl(req.body.url);
            } else {
                screenshot.link = oldScreenshot.link;
            }

            await screenshotModel.updateScreenshot(scr_id, screenshot.link);
            res.status(200).json({ message: 'Screenshot updated successfully' });
        } else {
            res.status(404).json({ message: 'Screenshot not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteScreenshot = async (req, res) => {
    const { scr_id } = req.params;

    try {
        const screenshot = await screenshotModel.getScreenshotById(scr_id);

        if (screenshot) {
            if (screenshot.link.startsWith('uploads/')) {
                const filePath = path.join(process.cwd(), 'public', screenshot.link);
                fs.unlinkSync(filePath);
            }

            await screenshotModel.deleteScreenshot(scr_id);
            res.status(200).json({ message: 'Screenshot deleted successfully' });
        } else {
            res.status(404).json({ message: 'Screenshot not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createScreenshot,
    getScreenshot,
    getAllScreenshots,
    updateScreenshot,
    deleteScreenshot
};
