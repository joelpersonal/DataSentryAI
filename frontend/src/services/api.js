import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)

    // Handle common error cases
    if (error.response?.status === 404) {
      throw new Error('Resource not found')
    } else if (error.response?.status === 500) {
      throw new Error('Server error occurred')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout')
    }

    throw error
  }
)

// Upload API
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('csvFile', file)

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // 60 seconds for large files
  })

  return response.data
}

export const getFileInfo = async (fileId) => {
  const response = await api.get(`/upload/${fileId}`)
  return response.data
}

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/upload/${fileId}`)
  return response.data
}

// Analysis API
export const analyzeDataQuality = async (fileId) => {
  const response = await api.post('/analysis/quality', { fileId })
  return response.data
}

export const detectDuplicates = async (fileId, threshold = 0.8) => {
  const response = await api.post('/analysis/duplicates', { fileId, threshold })
  return response.data
}

export const generateReport = async (fileId) => {
  const response = await api.post('/analysis/report', { fileId })
  return response.data
}

export const exportCleanedData = async (fileId, format = 'csv', removeDuplicates = false) => {
  const response = await api.post('/analysis/export', {
    fileId,
    format,
    removeDuplicates
  }, {
    responseType: format === 'csv' ? 'blob' : 'json'
  })

  if (format === 'csv') {
    // Handle CSV download
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cleaned_data_${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    return { success: true, message: 'File downloaded successfully' }
  }

  return response.data
}

export const getCleanedDataPreview = async (fileId, format = 'json', removeDuplicates = false) => {
  const response = await api.post('/analysis/export', {
    fileId,
    format,
    removeDuplicates,
    preview: true
  }, {
    responseType: 'json'
  })

  return response.data
}

export const getAllAnalysisSummaries = async () => {
  const response = await api.get('/analysis/summaries')
  return response.data
}

// AI API
export const generateAISuggestions = async (fileId, field, values, context) => {
  const response = await api.post('/ai/suggestions', {
    fileId,
    field,
    values,
    context
  })
  return response.data
}

export const mapJobTitles = async (fileId, jobTitles) => {
  const response = await api.post('/ai/job-mapping', {
    fileId,
    jobTitles
  })
  return response.data
}

export const standardizeIndustry = async (fileId, industries) => {
  const response = await api.post('/ai/standardize-industry', {
    fileId,
    industries
  })
  return response.data
}

export const aiCopilotChat = async (fileId, message, context) => {
  const response = await api.post('/ai/chat', {
    fileId,
    message,
    context
  })
  return response.data
}

export const generateBusinessInsights = async (fileId, analysisResults) => {
  const response = await api.post('/ai/insights', {
    fileId,
    analysisResults
  })
  return response.data
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api