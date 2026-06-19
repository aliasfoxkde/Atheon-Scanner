import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'
import './styles/theme.css'

// Prevent theme flash on page load
const preventedTheme = document.documentElement.getAttribute('data-theme');
if (preventedTheme) {
  document.documentElement.classList.add(preventedTheme);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
