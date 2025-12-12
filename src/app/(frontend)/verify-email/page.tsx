// app/verify-email/page.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const router = useRouter()

  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid or expired code")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/sign-in")
      }, 1500)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700 space-y-4 text-center">
          <h1 className="text-2xl font-extrabold text-gray-50">
            Email verification
          </h1>
          <p className="text-sm text-gray-400">
            Verification email is missing. Please sign up again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-50">
            Verify your email
          </h1>
          <p className="text-sm text-gray-400">
            We sent a 6‑digit code to{" "}
            <span className="font-mono text-teal-400">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-100 tracking-[0.3em] text-center"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-400 bg-red-900/30 p-3 rounded-xl border border-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm font-medium text-emerald-400 bg-emerald-900/30 p-3 rounded-xl border border-emerald-600">
              Email verified! Redirecting you to sign in…
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !otp}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Didn&apos;t get the email? Check your spam folder.
        </p>
      </div>
    </div>
  )
}
