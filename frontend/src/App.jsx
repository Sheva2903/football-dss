import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import DiscoveryPage from './pages/DiscoveryPage.jsx'
import PlayerAnalysisPage from './pages/PlayerAnalysisPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/players/:id" element={<PlayerAnalysisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
