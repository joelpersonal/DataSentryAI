import React, { useState, useEffect } from 'react'
import { Brain, Send, Loader, Lightbulb, MessageCircle, Sparkles, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { aiCopilotChat, generateBusinessInsights } from '../services/api'

const AIInsightsPanel = ({ fileId, analysisResults }) => {
  const [chatMessages, setChatMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [businessInsights, setBusinessInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => {
    if (fileId && analysisResults && !businessInsights) {
      generateInsights()
    }
  }, [fileId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!currentMessage.trim() || loading) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setLoading(true)

    // Add user message to chat immediately for better UX
    const newMessages = [...chatMessages, { type: 'user', content: userMessage, timestamp: new Date() }]
    setChatMessages(newMessages)

    // Show typing indicator immediately
    setChatMessages(prev => [...prev, {
      type: 'ai',
      content: '...',
      timestamp: new Date(),
      isTyping: true
    }])

    try {
      const context = chatMessages.slice(-4).map(msg => `${msg.type}: ${msg.content}`).join('\n') // Limit context for speed
      const startTime = Date.now()
      
      const response = await aiCopilotChat(fileId, userMessage, context)
      const responseTime = Date.now() - startTime

      if (response.success) {
        // Remove typing indicator and add real response
        setChatMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          return [...withoutTyping, {
            type: 'ai',
            content: response.response,
            timestamp: new Date(),
            responseTime: response.responseTime || 'ai-powered',
            processingTime: `${responseTime}ms`
          }]
        })
        
        // Show success toast for fast responses
        if (responseTime < 1000) {
          toast.success('⚡ Instant AI response!')
        }
      } else {
        throw new Error(response.message || 'AI chat failed')
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Remove typing indicator and show error
      setChatMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping)
        return [...withoutTyping, {
          type: 'ai',
          content: 'I apologize, but I\'m having trouble connecting right now. Try asking about data quality, improvements, or business impact - I have built-in knowledge for these topics!',
          timestamp: new Date(),
          isError: true
        }]
      })
      
      toast.error('AI temporarily unavailable - try common questions!')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    setInsightsLoading(true)
    try {
      const response = await generateBusinessInsights(fileId, analysisResults)
      if (response.success) {
        setBusinessInsights(response.businessInsights)
        toast.success('Business insights generated!')
      } else {
        throw new Error(response.message || 'Failed to generate insights')
      }
    } catch (error) {
      console.error('Insights error:', error)
      toast.error('Failed to generate business insights')
    } finally {
      setInsightsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What are the main data quality issues in my dataset?",
    "How can I improve my data quality score?",
    "What's the business impact of these data issues?",
    "Which fields need the most attention?",
    "How should I prioritize fixing these issues?"
  ]

  const quickActions = [
    { icon: "🎯", text: "Prioritize fixes", question: "What should I fix first for maximum impact?" },
    { icon: "📊", text: "Business impact", question: "What's the business impact of these data issues?" },
    { icon: "⚡", text: "Quick wins", question: "What are the easiest issues to fix quickly?" },
    { icon: "🔍", text: "Explain issues", question: "Explain the main data quality issues found" },
    { icon: "📈", text: "Improve score", question: "How can I improve my data quality score?" },
    { icon: "🚀", text: "Export tips", question: "How should I export and use the cleaned data?" }
  ]

  const handleSuggestedQuestion = (question) => {
    setCurrentMessage(question)
  }

  return (
    <div className="space-y-6">
      {/* Business Insights */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center">
            <Lightbulb className="h-5 w-5 text-amber-500 mr-3" />
            Executive Summary
          </h3>
          <button
            onClick={generateInsights}
            disabled={insightsLoading}
            className="btn-primary py-2 px-6 rounded-full text-xs font-black uppercase tracking-widest"
          >
            {insightsLoading ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {insightsLoading ? 'Scanning...' : 'Run Diagnostics'}
          </button>
        </div>

        <div className="p-8">
          {businessInsights ? (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Business Impact</h4>
                <p className="text-slate-800 font-medium leading-relaxed">{businessInsights.businessImpact}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100/50">
                  <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">ROI Potential</h4>
                  <p className="text-emerald-900 font-bold">{businessInsights.roi}</p>
                </div>
                <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100/50">
                  <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-3">Critical Risk Level</h4>
                  <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${businessInsights.riskLevel === 'high' ? 'bg-rose-100 text-rose-700' :
                    businessInsights.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {businessInsights.riskLevel?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Awaiting Diagnostic Trigger</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Copilot Chat */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center">
            <Brain className="h-5 w-5 text-indigo-600 mr-3" />
            Neural AI Assistant
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Neural AI Assistant Ready</h4>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">I can help analyze your data quality, suggest improvements, and provide business insights.</p>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(action.question)}
                    className="flex items-center space-x-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">{action.text}</span>
                  </button>
                ))}
              </div>

              {/* Suggested Questions */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or ask directly:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.slice(0, 2).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs bg-slate-50 text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      {question.length > 40 ? question.substring(0, 40) + '...' : question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.isError 
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : message.isTyping
                        ? 'bg-slate-100 text-slate-600 animate-pulse'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs font-medium">AI thinking...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.responseTime && (
                          <div className="flex items-center space-x-1">
                            {message.responseTime === 'instant' && <span className="text-emerald-500">⚡</span>}
                            {message.responseTime === 'ai-powered' && <span className="text-indigo-500">🤖</span>}
                            {message.responseTime === 'intelligent-fallback' && <span className="text-amber-500">🧠</span>}
                            <span className="text-xs font-mono">{message.processingTime}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask about data quality, improvements, business impact..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                disabled={loading}
              />
              {currentMessage && (
                <button
                  type="button"
                  onClick={() => setCurrentMessage('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !currentMessage.trim()}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                loading || !currentMessage.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
              }`}
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          
          {/* Quick suggestions when typing */}
          {currentMessage.length > 2 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Quick suggestions:</span>
              {quickActions.slice(0, 3).map((action, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessage(action.question)}
                  className="text-xs bg-white text-slate-600 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  {action.icon} {action.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Questions (when chat is active) */}
        {chatMessages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInsightsPanel