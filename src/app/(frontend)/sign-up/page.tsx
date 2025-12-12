// app/sign-up/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Assuming Input and GoogleLogin components use the previously defined dark mode styles
import Input from "../components/Input"; 
import { GoogleLogin } from "../components/auth/GoogleLogin";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        // Correcting type casting for errors state update
        setErrors((data.error as { [key: string]: string | undefined }) || { general: "Something went wrong" });
        return;
      }

      // Success → go to OTP verification
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    // 1. BACKGROUND: Deep dark grey background
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
              Create Account
            </h1>
            {/* 5. SUBTITLE: Muted light grey text */}
            <p className="text-gray-400">Join our coding platform today</p>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
          {/* Input components are assumed to use dark mode styles */}
          <Input
            label="Full Name"
            name="name"
            placeholder="Please enter your full name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="Please enter your email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter a password"
            required
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {errors.general && (
            // 6. GENERAL ERROR: Dark mode error block
            <p className="text-sm font-medium text-red-400 bg-red-900/30 p-3 rounded-xl border border-red-600">
              {errors.general}
            </p>
          )}

          {/* 7. SUBMIT BUTTON: Teal gradient button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-4">
          {/* 8. DIVIDER: Dark mode styling */}
          <div className="flex-grow border-t border-gray-700" />
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium uppercase px-3 bg-gray-800">
            Or sign up with
          </span>
          <div className="flex-grow border-t border-gray-700" />
        </div>

        {/* Google Login (Uses dark mode styles) */}
        <div>
          <GoogleLogin />
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-6">
          {/* 9. FOOTER LINK: Teal accent color */}
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/sign-in" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}