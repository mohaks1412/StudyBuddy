// app/verify-email/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"  // ✅ ADDED
import { ShieldCheck, Loader2, ArrowRight, Mail } from "lucide-react"
import NothingToSeeHere from "@/app/(frontend)/components/NothingToSeeHere"

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
      // 1. Verify OTP on backend
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp}),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid or expired code")
        return
      }

      // 2. NextAuth signIn (creates session)
      const loginResult = await signIn("credentials", {
        identifier: email,
        otp: otp,
        redirect: true
      })

      
      if (!loginResult?.error) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/posts") 
        }, 1500)
      } else {
        setError("Login failed after verification")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle missing email
  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--color-bg))] p-6">
        <NothingToSeeHere />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))]">
          Verification context missing
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))] px-6 selection:bg-[rgb(var(--color-accent)/0.2)]">
      <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-[rgb(var(--color-accent))] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative w-20 h-20 rounded-[2rem] bg-[rgb(var(--color-bg-soft))] border border-[rgb(var(--color-border))] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-8 h-8 text-[rgb(var(--color-accent))]" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter leading-none">
              Verify <span className="text-[rgb(var(--color-accent))]">Identity.</span>
            </h1>
            <p className="text-sm font-medium text-[rgb(var(--color-fg-muted))] max-w-[280px]">
              We sent a security code to <span className="text-[rgb(var(--color-fg))] font-bold">{email}</span>
            </p>
          </div>
        </header>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="p-8 rounded-[3rem] bg-[rgb(var(--color-bg-soft)/0.4)] border border-[rgb(var(--color-border)/0.5)] backdrop-blur-xl shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] ml-1">
                6-Digit Security Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-transparent border-0 border-b-2 border-[rgb(var(--color-border)/0.5)] rounded-none px-0 py-4 text-3xl font-black tracking-[0.5em] text-center focus:border-[rgb(var(--color-accent))] transition-all outline-none placeholder:opacity-20"
                placeholder="000000"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-[rgb(var(--color-danger)/0.05)] border border-[rgb(var(--color-danger)/0.1)] animate-in zoom-in-95">
                <p className="text-xs font-bold text-[rgb(var(--color-danger))] uppercase tracking-tight text-center">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl bg-[rgb(var(--color-success)/0.05)] border border-[rgb(var(--color-success)/0.1)] animate-in zoom-in-95">
                <p className="text-xs font-bold text-[rgb(var(--color-success))] uppercase tracking-tight text-center">
                  Identity Confirmed. Redirecting to dashboard...
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[rgb(var(--color-fg))] text-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-fg))] font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <footer className="text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-fg-subtle))] opacity-40">
            Check your spam folder if the email is missing
          </p>
          <button 
            type="button"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[rgb(var(--color-accent))] hover:underline"
          >
            Resend Code
          </button>
        </footer>
      </div>
    </div>
  )
}
