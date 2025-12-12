// app/sign-in/page.tsx
"use client";

import CredentialLogin from "../components/auth/CredentialLogin";
import { GoogleLogin } from "../components/auth/GoogleLogin";

export default function SignInPage() {
  return (
    // 1. BACKGROUND: Deep dark grey background with a subtle dark gradient
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* 2. CARD CONTAINER: Dark card with softer border and shadow */}
      <div className="max-w-md w-full space-y-8 bg-gray-800 rounded-3xl shadow-2xl shadow-black/50 p-10 border border-gray-700">
        
        {/* Logo/Heading */}
        <div className="text-center space-y-4">
          {/* 3. LOGO ACCENT: Use Teal gradient for the logo background */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            {/* 4. HEADING: Light text for high contrast */}
            <h1 className="text-4xl font-extrabold text-gray-50">
              Welcome Back
            </h1>
            {/* 5. SUBTITLE: Muted light grey text */}
            <p className="text-gray-400">Sign in to continue to your coding platform</p>
          </div>
        </div>

        {/* Credentials Form (Uses previously styled dark-mode components) */}
        <div>
          <CredentialLogin />
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-4">
          {/* 6. DIVIDER LINE: Darker border color */}
          <div className="flex-grow border-t border-gray-700" />
          {/* 7. DIVIDER TEXT: Muted light text on a slightly lighter background */}
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium uppercase px-3 bg-gray-800">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-700" />
        </div>

        {/* Google Login (Uses previously styled dark-mode component) */}
        <div>
          <GoogleLogin />
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-6">
          {/* 8. FOOTER TEXT: Muted light grey text */}
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            {/* 9. LINK: Teal accent color for links */}
            <a href="/sign-up" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}