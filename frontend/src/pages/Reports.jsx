import React, { useState, useEffect } from 'react'
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, Loader, ExternalLink } from 'lucide-react'
import { getAllAnalysisSummaries } from '../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateReport as fetchReport } from '../services/api'

const Reports = ({ onNavigate }) => {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await getAllAnalysisSummaries()
      if (response.success) {
        // Map backend summary to report format
        const mappedReports = response.summaries.map(s => ({
          id: s.fileId,
          name: `Analysis: ${s.fileName}`,
          fileName: s.fileName,
          qualityScore: s.qualityScore,
          issues: s.issuesCount,
          duplicates: 0, // Placeholder
          createdAt: s.uploadedAt,
          status: 'completed'
        }))
        setReports(mappedReports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId) => {
    try {
      const response = await fetchReport(fileId)
      if (response.success) {
        const blob = new Blob([response.report], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Report downloaded')
      }
    } catch (err) {
      toast.error('Failed to download report')
    }
  }

  const getQualityColor = (score) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getQualityBadge = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    if (score >= 60) return 'bg-amber-50 text-amber-600 border-amber-100'
    return 'bg-rose-50 text-rose-600 border-rose-100'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const avgQualityScore = reports.length > 0
    ? Math.round(reports.reduce((sum, report) => sum + report.qualityScore, 0) / reports.length)
    : 0
  const totalIssues = reports.reduce((sum, report) => sum + report.issues, 0)
  const totalDuplicates = reports.reduce((sum, report) => sum + report.duplicates, 0)

  return (
    <div className="animate-in fade-in duration-700">

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className={`h-8 w-8 ${getQualityColor(avgQualityScore)}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Quality Score</p>
              <p className={`text-2xl font-bold ${getQualityColor(avgQualityScore)}`}>
                {avgQualityScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-error-100 rounded-lg flex items-center justify-center">
                <span className="text-error-600 font-bold text-sm">2x</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Duplicates</p>
              <p className="text-2xl font-bold text-gray-900">{totalDuplicates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              Filter by Date
            </button>
            <button className="btn-primary">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Report Name</th>
                <th className="table-header-cell">File</th>
                <th className="table-header-cell">Quality Score</th>
                <th className="table-header-cell">Issues</th>
                <th className="table-header-cell">Duplicates</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{report.name}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-600 font-mono">{report.fileName}</div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getQualityColor(report.qualityScore)}`}>
                        {report.qualityScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getQualityBadge(report.qualityScore)}`}>
                        {report.qualityScore >= 80 ? 'Good' : report.qualityScore >= 60 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {report.issues > 0 ? (
                      <span className="text-warning-600 font-medium">{report.issues}</span>
                    ) : (
                      <span className="text-success-600">0</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {report.duplicates > 0 ? (
                      <span className="text-error-600 font-medium">{report.duplicates}</span>
                    ) : (
                      <span className="text-success-600">0</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-600">
                      {formatDate(report.createdAt)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onNavigate('analysis', report.id)}
                        className="text-secondary-600 hover:text-secondary-800 text-sm font-medium flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="text-black hover:text-slate-600 text-sm font-bold flex items-center"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State (if no reports) */}
      {reports.length === 0 && (
        <div className="card">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-4">
              Upload and analyze your first CSV file to generate reports.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload Data
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
    </div>
  )
}

export default Reports