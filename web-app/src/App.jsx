import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Submit from './pages/Submit'
import Reports from './pages/Reports'
import ApiDocs from './pages/ApiDocs'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/api" element={<ApiDocs />} />
      </Routes>
    </AppLayout>
  )
}

export default App
