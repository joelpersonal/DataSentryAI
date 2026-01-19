const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Papa = require('papaparse');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const fileName = file.originalname.toLowerCase();
  const isCSV = fileName.endsWith('.csv') || fileName.endsWith('.txt');
  const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
  
  if (isCSV || isMimeTypeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed. Please upload a .csv file containing your data.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// Upload and parse CSV file
router.post('/', upload.single('csvFile'), uploadController.uploadAndParse);

// Get file info
router.get('/:fileId', uploadController.getFileInfo);

// Delete uploaded file
router.delete('/:fileId', uploadController.deleteFile);

module.exports = router;