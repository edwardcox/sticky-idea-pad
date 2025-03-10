
import React from 'react';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { StickyNote } from 'lucide-react';

const Auth = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const isSignUp = location.pathname.includes('sign-up');
  
  // Redirect to home if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f9]">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Sticky Ideas</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md">
            {isSignUp ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center">Create your account</h2>
                <SignUp redirectUrl="/sticky-ideas" signInUrl="/sticky-ideas/sign-in" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
                <SignIn redirectUrl="/sticky-ideas" signUpUrl="/sticky-ideas/sign-up" />
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <p>©2025 Edward Cox • Version 1.0.2</p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
