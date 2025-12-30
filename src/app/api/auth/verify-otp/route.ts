// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import authService from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    await authService.verifyOTP(email, otp);

    return NextResponse.json({ 
      success: true, 
      redirect: "/dashboard"
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
