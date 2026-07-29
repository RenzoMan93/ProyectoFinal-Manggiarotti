import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import FirebaseSetupNeeded from './components/FirebaseSetupNeeded.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { firebaseConfigurado } from './firebase/config'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {firebaseConfigurado ? (
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      ) : (
        <FirebaseSetupNeeded />
      )}
    </ErrorBoundary>
  </StrictMode>,
)
