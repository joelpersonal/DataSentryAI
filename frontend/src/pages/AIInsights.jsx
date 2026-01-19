import React, { useState, useEffect } from 'react'
import { Brain, Sparkles, TrendingUp, Target, Lightbulb, MessageCircle, Loader, ChevronDown } from 'lucide-react'
import { getAllAnalysisSummaries, analyzeDataQuality } from '../services/api'
import AIInsightsPanel from '../components/AIInsightsPanel'
import toast from 'react-hot-toast'

const AIInsights = () => {
  const [summaries, setSummaries] = useState([])
  const [selectedFileId, setSelectedFileId] = useState(null)
  const [fullAnalysis, setFullAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    setLoading(true)
    try {
      const response = await getAllAnalysisSummaries()
      if (response.success && response.summaries.length > 0) {
        setSummaries(response.summaries)
        const mostRecent = response.summaries[0].fileId
        setSelectedFileId(mostRecent)
        loadFullAnalysis(mostRecent)
      }
    } catch (error) {
      console.error('Failed to fetch summaries:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const loadFullAnalysis = async (fileId) => {
    setAnalysisLoading(true)
    try {
      const response = await analyzeDataQuality(fileId)
      if (response.success) {
        setFullAnalysis(response.analysis)
      }
    } catch (error) {
      console.error('Failed to load full analysis:', error)
      toast.error('Failed to load detailed insights')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const fileId = e.target.value
    setSelectedFileId(fileId)
    loadFullAnalysis(fileId)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-50 border-error-200'
      case 'medium': return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'low': return 'text-success-600 bg-success-50 border-success-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-5 w-5 text-success" />
      case 'warning': return <Target className="h-5 w-5 text-warning" />
      case 'negative': return <Target className="h-5 w-5 text-error" />
      default: return <Lightbulb className="h-5 w-5 text-secondary" />
    }
  }

  return (
    <div>
      {/* Header Section - Centered */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-black tracking-tight mb-4 flex items-center justify-center">
          <Brain className="h-10 w-10 text-black mr-4" />
          Neural Insights Engine
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium mb-8">
          Deep learning diagnostics and structural intelligence parsed from your enterprise assets.
        </p>

        {summaries.length > 0 && (
          <div className="max-w-xs mx-auto relative">
            <label htmlFor="file-selector" className="sr-only">Select Analysis Stream</label>
            <div className="relative">
              <select
                id="file-selector"
                value={selectedFileId || ''}
                onChange={handleFileChange}
                className="block w-full pl-12 pr-10 py-3 text-sm font-bold border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-2xl appearance-none bg-white shadow-xl shadow-slate-100/50 transition-all hover:border-slate-300"
              >
                {summaries.map((s) => (
                  <option key={s.fileId} value={s.fileId}>
                    {s.fileName} ({new Date(s.uploadedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-slate-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader className="h-12 w-12 animate-spin text-secondary mb-4" />
          <p className="text-gray-500">Loading your AI insights library...</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="card text-center py-16">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Analyses Found</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't analyzed any data yet. Upload a CSV file and click "Start AI Analysis" to generate intelligent insights.
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="btn-primary"
          >
            Go to Upload
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {analysisLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-secondary mb-3" />
              <p className="text-gray-500 italic">Processing specialized insights for this dataset...</p>
            </div>
          ) : fullAnalysis ? (
            <AIInsightsPanel fileId={selectedFileId} analysisResults={fullAnalysis} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a file above to view detailed AI insights.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIInsights