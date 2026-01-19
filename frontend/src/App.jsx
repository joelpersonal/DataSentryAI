import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Workspace from './pages/Workspace'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Workspace />} />
      <Route path="/upload" element={<Workspace />} />
      <Route path="/analysis/:fileId" element={<Workspace />} />
      <Route path="/reports" element={<Workspace />} />
      <Route path="/ai-insights" element={<Workspace />} />
    </Routes>
  )
}

export default App