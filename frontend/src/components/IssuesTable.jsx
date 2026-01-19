import React, { useState } from 'react'
import { AlertTriangle, Search, Filter } from 'lucide-react'

const IssuesTable = ({ issues, fieldStats }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter issues based on search and severity
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !searchTerm ||
      issue.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.value.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  // Paginate results
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + itemsPerPage)

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return 'badge-error'
      case 'medium':
        return 'badge-warning'
      case 'low':
        return 'badge-secondary'
      default:
        return 'badge-secondary'
    }
  }

  const getSeverityIcon = (severity) => {
    return <AlertTriangle className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Field Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Field Statistics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Field</th>
                <th className="table-header-cell">Total</th>
                <th className="table-header-cell">Missing</th>
                <th className="table-header-cell">Invalid</th>
                <th className="table-header-cell">Unique</th>
                <th className="table-header-cell">Completeness</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {Object.entries(fieldStats).map(([field, stats]) => {
                const completeness = Math.round(((stats.total - stats.missing) / stats.total) * 100)
                return (
                  <tr key={field}>
                    <td className="table-cell font-medium">{field}</td>
                    <td className="table-cell">{stats.total.toLocaleString()}</td>
                    <td className="table-cell">
                      {stats.missing > 0 ? (
                        <span className="text-warning-600 font-medium">{stats.missing}</span>
                      ) : (
                        <span className="text-success-600">0</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {stats.invalid > 0 ? (
                        <span className="text-error-600 font-medium">{stats.invalid}</span>
                      ) : (
                        <span className="text-success-600">0</span>
                      )}
                    </td>
                    <td className="table-cell">{stats.uniqueCount.toLocaleString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${completeness >= 80 ? 'bg-success' :
                                completeness >= 60 ? 'bg-warning' : 'bg-error'
                              }`}
                            style={{ width: `${completeness}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{completeness}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Data Quality Issues</h3>
          <span className="text-sm text-gray-500">
            {filteredIssues.length} of {issues.length} issues
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        {paginatedIssues.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Row</th>
                    <th className="table-header-cell">Field</th>
                    <th className="table-header-cell">What's wrong?</th>
                    <th className="table-header-cell text-rose-600 font-black">Why?</th>
                    <th className="table-header-cell text-emerald-600 font-black">How to fix?</th>
                    <th className="table-header-cell">Severity</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {paginatedIssues.map((issue, index) => (
                    <tr key={index}>
                      <td className="table-cell font-mono text-sm">{issue.row}</td>
                      <td className="table-cell font-bold">{issue.field}</td>
                      <td className="table-cell font-medium">{issue.issue}</td>
                      <td className="table-cell text-[11px] text-slate-500 leading-tight italic max-w-xs">
                        {issue.explanation || 'Protocol violation detected.'}
                      </td>
                      <td className="table-cell text-xs font-bold text-emerald-700">
                        {issue.recommendation || 'Verify source data.'}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getSeverityBadge(issue.severity)} flex items-center space-x-1`}>
                          {getSeverityIcon(issue.severity)}
                          <span className="capitalize">{issue.severity}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded ${currentPage === page
                              ? 'bg-secondary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-600">
              {searchTerm || severityFilter !== 'all'
                ? 'No issues match your current filters.'
                : 'Your data quality looks great!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IssuesTable