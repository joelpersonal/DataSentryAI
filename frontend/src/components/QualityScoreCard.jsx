import React from 'react'

const QualityScoreCard = ({ title, score, icon: Icon, color, isCount = false }) => {
  const getScoreDisplay = () => {
    if (isCount) {
      return score.toLocaleString()
    }
    return `${score}%`
  }

  const getProgressWidth = () => {
    if (isCount) return '0%'
    return `${Math.min(score, 100)}%`
  }

  const getProgressColor = () => {
    if (isCount) return 'bg-gray-200'
    if (score >= 80) return 'bg-success'
    if (score >= 60) return 'bg-warning'
    return 'bg-error'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gray-100`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {getScoreDisplay()}
            </p>
          </div>
        </div>
      </div>
      
      {!isCount && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: getProgressWidth() }}
          />
        </div>
      )}
    </div>
  )
}

export default QualityScoreCard