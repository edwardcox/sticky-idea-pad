
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

// Get Clerk publishable key from environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Create a flag to check if we're in development mode without a key
const isDevelopmentWithoutKey = import.meta.env.DEV && !PUBLISHABLE_KEY

// For development, use a mock key if not provided
const publishableKey = isDevelopmentWithoutKey 
  ? 'pk_test_dummy-key-for-development'
  : PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={publishableKey} 
      afterSignOutUrl="/sticky-ideas"
    >
      <BrowserRouter basename="/sticky-ideas">
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
