const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (use database in production)
const fileStorage = new Map();

const uploadAndParse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a CSV file to upload',
        code: 'NO_FILE'
      });
    }

    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({
        error: 'Empty file',
        message: 'The uploaded file is empty. Please upload a valid CSV file with data.',
        code: 'EMPTY_FILE'
      });
    }

    const fileId = uuidv4();
    const filePath = req.file.path;

    // Read and parse CSV file with enhanced error handling
    let csvContent;
    try {
      csvContent = fs.readFileSync(filePath, 'utf8');
    } catch (readError) {
      return res.status(400).json({
        error: 'File read error',
        message: 'Unable to read the uploaded file. Please ensure it is a valid CSV file.',
        code: 'READ_ERROR'
      });
    }

    // Validate CSV content
    if (!csvContent || csvContent.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty CSV content',
        message: 'The CSV file appears to be empty or contains no readable data.',
        code: 'EMPTY_CONTENT'
      });
    }

    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header ? header.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') : '',
      transform: (value) => value ? value.toString().trim() : '',
      dynamicTyping: false, // Keep all values as strings for better control
      encoding: 'utf8'
    });

    // Enhanced validation
    if (!parseResult.data || parseResult.data.length === 0) {
      return res.status(400).json({
        error: 'No data found',
        message: 'The CSV file contains no data rows. Please ensure your file has data below the header row.',
        code: 'NO_DATA'
      });
    }

    if (!parseResult.meta.fields || parseResult.meta.fields.length === 0) {
      return res.status(400).json({
        error: 'No headers found',
        message: 'The CSV file must have column headers in the first row.',
        code: 'NO_HEADERS'
      });
    }

    // Filter out completely empty rows
    const validData = parseResult.data.filter(row => {
      return Object.values(row).some(value => value && value.toString().trim() !== '');
    });

    if (validData.length === 0) {
      return res.status(400).json({
        error: 'No valid data',
        message: 'All data rows appear to be empty. Please check your CSV file format.',
        code: 'NO_VALID_DATA'
      });
    }

    // Log parsing warnings but don't fail
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing warnings:', parseResult.errors);
    }

    const fileInfo = {
      id: fileId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: filePath,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      headers: parseResult.meta.fields || [],
      rowCount: validData.length,
      data: validData,
      parseErrors: parseResult.errors,
      totalRowsParsed: parseResult.data.length,
      validRowsCount: validData.length
    };

    // Store file info
    fileStorage.set(fileId, fileInfo);

    // Return preview (first 50 rows for performance)
    const previewData = validData.slice(0, 50);

    res.json({
      success: true,
      fileId,
      message: 'File uploaded and parsed successfully',
      info: {
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        rowCount: fileInfo.rowCount,
        headers: fileInfo.headers,
        uploadedAt: fileInfo.uploadedAt,
        parseErrors: fileInfo.parseErrors,
        totalRowsParsed: fileInfo.totalRowsParsed,
        validRowsCount: fileInfo.validRowsCount
      },
      preview: previewData
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'An unexpected error occurred during file upload',
      code: 'UPLOAD_ERROR'
    });
  }
};

const getFileInfo = (req, res) => {
  const { fileId } = req.params;
  const fileInfo = fileStorage.get(fileId);

  if (!fileInfo) {
    return res.status(404).json({
      error: 'File not found',
      message: 'The requested file does not exist or has been deleted'
    });
  }

  res.json({
    success: true,
    info: {
      id: fileInfo.id,
      originalName: fileInfo.originalName,
      size: fileInfo.size,
      rowCount: fileInfo.rowCount,
      headers: fileInfo.headers,
      uploadedAt: fileInfo.uploadedAt
    }
  });
};

const deleteFile = (req, res) => {
  const { fileId } = req.params;
  const fileInfo = fileStorage.get(fileId);

  if (!fileInfo) {
    return res.status(404).json({
      error: 'File not found',
      message: 'The requested file does not exist'
    });
  }

  try {
    // Delete physical file
    if (fs.existsSync(fileInfo.path)) {
      fs.unlinkSync(fileInfo.path);
    }

    // Remove from storage
    fileStorage.delete(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: error.message
    });
  }
};

// Export file storage for other controllers
const getFileData = (fileId) => {
  return fileStorage.get(fileId);
};

module.exports = {
  uploadAndParse,
  getFileInfo,
  deleteFile,
  getFileData
};