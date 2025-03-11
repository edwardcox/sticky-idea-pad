
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

// Get Clerk publishable key from environment variable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_d29ya2luZy1yZXB0aWxlLTc2LmNsZXJrLmFjY291bnRzLmRldiQ';

// Create a flag to check if we're in development mode without a key
const isDevelopmentWithoutKey = import.meta.env.DEV && !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/sticky-ideas"
    >
      <BrowserRouter basename="/sticky-ideas">
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
