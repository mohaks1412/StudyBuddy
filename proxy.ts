import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req : NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET 
  })

  // Protect these routes
  const protectedPaths = ["/posts", "/dashboard"]
  
  if (protectedPaths.some(path => req.nextUrl.pathname.startsWith(path)) && !token) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/posts/:path*", "/dashboard/:path*"]
}
