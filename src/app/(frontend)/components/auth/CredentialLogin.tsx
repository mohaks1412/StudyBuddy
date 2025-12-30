
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Input from "../Input"; // Assuming Input component uses the previously defined dark mode styles

export default function CredentialLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      identifier,
      password,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email/username or password.");
      return;
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <Input
        label="Email or Username"
        placeholder="Please enter your email or username" // Corrected placeholder text
        required
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <Input
        label="Password"
        placeholder="Please enter your password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        // Style updated for dark mode: softer red text, slightly more prominent
        <p className="text-sm font-medium text-red-400">{error}</p>
      )}

      {/* Primary Action Button (Teal/Dark Grey Theme) */}
      <button
        type="submit"
        disabled={loading}
        // Button Styles:
        // - Teal background (accent color)
        // - White text (high contrast)
        // - Larger padding, full rounded corners, and shadow for modern feel
        // - Hover effect is a subtle darkening
        // - Disabled state uses softer opacity
        className="w-full bg-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      
      {/* You might want a subtle loading indicator. Here is a simple implementation: */}
      {loading && (
          <div className="flex justify-center pt-2">
              <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent text-teal-500 rounded-full" role="status" aria-label="loading"></span>
          </div>
      )}
    </form>
  );
}