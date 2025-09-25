const express = require('express');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../services/imageUploadService');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Upload single image
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { folder, filename } = req.body;
    if (!folder || !filename) {
      return res.status(400).json({ message: 'Folder and filename are required' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      folder,
      filename
    );

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

// Upload multiple images
router.post('/upload-multiple', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const { folder } = req.body;
    if (!folder) {
      return res.status(400).json({ message: 'Folder is required' });
    }

    const uploadPromises = req.files.map((file, index) => {
      const filename = `${Date.now()}_${index}`;
      return uploadToCloudinary(file.buffer, folder, filename);
    });

    const results = await Promise.all(uploadPromises);

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }));

    res.json({ images });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

// Delete image
router.delete('/delete/:publicId', verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    // Replace forward slashes with encoded version for URL safety
    const safePublicId = publicId.replace(/\//g, '%2F');
    const actualPublicId = decodeURIComponent(safePublicId);
    
    const result = await deleteFromCloudinary(actualPublicId);
    res.json({ message: 'Image deleted successfully', result });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Image deletion failed', error: error.message });
  }
});

module.exports = router;
