import React, { useState } from 'react'
import { XCircle, Eye, EyeOff, Users } from 'lucide-react'

const DuplicatesView = ({ duplicates }) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  if (!duplicates || !duplicates.groups || duplicates.groups.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
          <p className="text-gray-600">
            Your data appears to be free of duplicate records.
          </p>
        </div>
      </div>
    )
  }

  const toggleGroup = (groupIndex) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex)
    } else {
      newExpanded.add(groupIndex)
    }
    setExpandedGroups(newExpanded)
  }

  const getSimilarityColor = (similarity) => {
    if (similarity === 100) return 'text-error-600 bg-error-50'
    if (similarity >= 90) return 'text-warning-600 bg-warning-50'
    return 'text-secondary-600 bg-secondary-50'
  }

  // Paginate results
  const totalPages = Math.ceil(duplicates.groups.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedGroups = duplicates.groups.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-error" />
            <div>
              <p className="text-sm font-medium text-gray-600">Duplicate Groups</p>
              <p className="text-2xl font-bold text-gray-900">{duplicates.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-sm font-medium text-gray-600">Affected Rows</p>
              <p className="text-2xl font-bold text-gray-900">{duplicates.affectedRows}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-secondary-100 rounded-lg flex items-center justify-center">
              <span className="text-secondary-600 font-bold text-sm">%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Threshold</p>
              <p className="text-2xl font-bold text-gray-900">{duplicates.threshold}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Groups */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Duplicate Groups</h3>
          <span className="text-sm text-gray-500">
            {duplicates.groups.length} groups found
          </span>
        </div>

        <div className="space-y-4">
          {paginatedGroups.map((group, groupIndex) => {
            const actualIndex = startIndex + groupIndex
            const isExpanded = expandedGroups.has(actualIndex)
            
            return (
              <div key={actualIndex} className="border border-gray-200 rounded-lg">
                {/* Group Header */}
                <div 
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleGroup(actualIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="font-medium text-gray-900">
                          Group {actualIndex + 1}
                        </span>
                      </div>
                      
                      <span className="badge badge-secondary">
                        {group.duplicates.length + 1} records
                      </span>
                      
                      <span className={`badge ${getSimilarityColor(group.duplicates[0]?.similarity || 100)}`}>
                        {group.duplicates[0]?.similarity || 100}% match
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Original: Row {group.originalIndex + 1}
                    </div>
                  </div>
                </div>

                {/* Group Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Original Record */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">
                            Original Record (Row {group.originalIndex + 1})
                          </span>
                          <span className="badge bg-blue-100 text-blue-800">Original</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          {Object.entries(group.originalRow).map(([key, value]) => (
                            <div key={key} className="truncate">
                              <span className="font-medium text-blue-700">{key}:</span>{' '}
                              <span className="text-blue-600">{value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Duplicate Records */}
                      {group.duplicates.map((duplicate, dupIndex) => (
                        <div key={dupIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-red-800">
                              Duplicate Record (Row {duplicate.index + 1})
                            </span>
                            <span className={`badge ${getSimilarityColor(duplicate.similarity)}`}>
                              {duplicate.similarity}% match
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                            {Object.entries(duplicate.row).map(([key, value]) => {
                              const originalValue = group.originalRow[key]
                              const isDifferent = originalValue !== value
                              
                              return (
                                <div key={key} className="truncate">
                                  <span className="font-medium text-red-700">{key}:</span>{' '}
                                  <span className={`${isDifferent ? 'text-red-800 font-medium' : 'text-red-600'}`}>
                                    {value || '—'}
                                  </span>
                                  {isDifferent && (
                                    <span className="text-xs text-red-500 ml-1">*</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, duplicates.groups.length)} of {duplicates.groups.length} groups
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
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
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
      </div>
    </div>
  )
}

export default DuplicatesView