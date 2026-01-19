import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle, Loader, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadFile } from '../services/api'

const Upload = ({ onAnalysisStart }) => {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections && fileRejections.length > 0) {
      const error = fileRejections[0].errors[0]
      if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a CSV file.')
      } else if (error.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 10MB.')
      } else {
        toast.error(error.message)
      }
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const response = await uploadFile(file)

      if (response.success) {
        setUploadedFile(response)
        setPreview(response.preview)
        
        // Enhanced success message with file stats
        toast.success(`File uploaded successfully! ${response.info.rowCount} rows, ${response.info.headers.length} columns`)

        // AUTO-TRIGGER ANALYSIS FOR SEAMLESS FLOW
        if (onAnalysisStart) {
          onAnalysisStart(response.fileId)
        } else {
          navigate(`/analysis/${response.fileId}?tab=ai-insights`)
        }
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      
      // Enhanced error handling with specific error codes
      let errorMessage = 'Failed to upload file'
      
      if (error.response?.data) {
        const errorData = error.response.data
        errorMessage = errorData.message || errorMessage
        
        // Handle specific error codes
        switch (errorData.code) {
          case 'NO_FILE':
            errorMessage = 'Please select a CSV file to upload'
            break
          case 'EMPTY_FILE':
            errorMessage = 'The file is empty. Please upload a file with data.'
            break
          case 'NO_DATA':
            errorMessage = 'No data rows found. Please ensure your CSV has data below the headers.'
            break
          case 'NO_HEADERS':
            errorMessage = 'No column headers found. Please ensure the first row contains column names.'
            break
          case 'NO_VALID_DATA':
            errorMessage = 'All data rows appear to be empty. Please check your file format.'
            break
          default:
            errorMessage = errorData.message || errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/csv': ['.csv']
    },
    multiple: false,
    disabled: uploading
  })

  const handleAnalyze = () => {
    if (uploadedFile?.fileId) {
      if (onAnalysisStart) {
        onAnalysisStart(uploadedFile.fileId)
      } else {
        navigate(`/analysis/${uploadedFile.fileId}?tab=ai-insights`)
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Upload Area */}
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
              ? 'border-secondary-400 bg-secondary-50'
              : uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-secondary-400 hover:bg-secondary-50'
              }`}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center">
              {uploading ? (
                <Loader className="h-12 w-12 text-secondary animate-spin mb-4" />
              ) : (
                <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uploading ? 'Uploading...' : 'Drop your CSV file here'}
              </h3>

              <p className="text-gray-600 mb-4">
                {uploading
                  ? 'Processing your file...'
                  : isDragActive
                    ? 'Drop the file to upload'
                    : 'or click to browse files'
                }
              </p>

              {!uploading && (
                <div className="text-sm text-gray-500">
                  <p>Supported format: CSV</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Info */}
        {uploadedFile && (
          <div className="card mb-6 animate-fade-in">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                File Uploaded Successfully
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">File Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{uploadedFile.info.originalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{formatFileSize(uploadedFile.info.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rows:</span>
                    <span className="font-medium">{uploadedFile.info.rowCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Columns:</span>
                    <span className="font-medium">{uploadedFile.info.headers.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Column Headers</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedFile.info.headers.map((header, index) => (
                    <span
                      key={index}
                      className="badge badge-secondary text-xs"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Parse Errors */}
            {uploadedFile.info.parseErrors && uploadedFile.info.parseErrors.length > 0 && (
              <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-warning-600 mr-2" />
                  <h4 className="font-medium text-warning-800">Parse Warnings</h4>
                </div>
                <div className="text-sm text-warning-700">
                  {uploadedFile.info.parseErrors.slice(0, 3).map((error, index) => (
                    <p key={index}>Row {error.row}: {error.message}</p>
                  ))}
                  {uploadedFile.info.parseErrors.length > 3 && (
                    <p>... and {uploadedFile.info.parseErrors.length - 3} more warnings</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAnalyze}
                className="btn-primary flex items-center"
              >
                <Brain className="h-4 w-4 mr-2" />
                Start AI Analysis
              </button>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {preview && preview.length > 0 && (
          <div className="card animate-fade-in">
            <div className="card-header border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-black tracking-tight">Dataset Explorer</h3>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Stream</span>
              </div>
            </div>

            <div className="overflow-auto max-h-[600px] border border-slate-100 rounded-b-3xl">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    {uploadedFile.info.headers.map((header, index) => (
                      <th key={index} className="table-header-cell">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="table-body">
                  {preview.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {uploadedFile.info.headers.map((header, colIndex) => (
                        <td key={colIndex} className="table-cell">
                          <div className="max-w-xs truncate" title={row[header]}>
                            {row[header] || <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card mt-12">
          <div className="card-header border-b border-slate-50 pb-4 justify-center">
            <h3 className="text-xl font-extrabold text-black tracking-tight">Technical Specifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported File Format</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CSV files with comma separation</li>
                <li>• First row should contain column headers</li>
                <li>• UTF-8 encoding recommended</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">What We Analyze</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Missing values and data completeness</li>
                <li>• Email and phone number validation</li>
                <li>• Duplicate record detection</li>
                <li>• Data format consistency</li>
                <li>• AI-powered suggestions for improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload