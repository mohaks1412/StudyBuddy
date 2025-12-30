import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_USERNAME!,
    pass: process.env.GMAIL_APP_PASSWORD!, 
  },
});

export async function sendVerificationEmail(email: string, otp: string) {
  console.log("Sending verification email to", email, "with otp", otp);
  
  try {
    await transporter.sendMail({
      from: '"Mohak Sharma" <mohaksharma1412@gmail.com>',
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Your Verification Code</h2>
          <p>Your OTP code is:</p>
          <div style="font-size: 30px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    });
    
    console.log("Email sent successfully");
    return true;
  } catch (error: any) {
    console.error("Email error", error);
    return false;
  }
}
