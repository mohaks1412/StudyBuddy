// lib/actions/auth.ts
'use server';
import { redirect } from 'next/navigation';
import authService from '@/services/auth.service';
import { sendVerificationEmail } from '@/lib/mail';

export async function sendOtpAction(_prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    
    if (!email) {
      return { success: false, message: 'Email is required' };
    }

    // Generate fresh OTP via authService
    const otp = await authService.generateOTP(email);
    
    // Send email
    const emailSent = await sendVerificationEmail(email, otp);
    
    if (!emailSent) {
      return { success: false, message: 'Failed to send OTP' };
    }

    return { 
      success: true, 
      message: 'OTP sent! Check your email.',
      email 
    };
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
}
