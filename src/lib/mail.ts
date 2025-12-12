import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  
  email: string,
  otp: string
) {
  
  console.log("Sending verification email to", email, "with otp", otp)
  try {
    const result = await resend.emails.send({
      from: "YourApp <no-reply@mohaksharma.dev.com>",
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


    console.log("Email result", result);
    

    return true;
  } catch (error: any) {
    console.log("Email error", error);
    return false;
  }
}
