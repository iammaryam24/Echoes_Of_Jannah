import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { UserProvider } from './contexts/UserContext'
import { QuranAuthProvider } from './contexts/QuranAuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QuranAuthProvider>
          <UserProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
                success: {
                  icon: '✅',
                  style: {
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                  },
                },
                error: {
                  icon: '❌',
                  style: {
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                  },
                },
              }}
            />
            <App />
          </UserProvider>
        </QuranAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)