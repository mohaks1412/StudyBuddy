import { NextResponse } from "next/server";
import { CreateUserSchema } from "@/schemas/user.schema";
import authService from "@/services/auth.service";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate using Zod
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    

    // 2. make sure email doesnt get duplicate
    const userAlreadyExists = await authService.findUserByEmailOrUsername(email);
    if (userAlreadyExists) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // 3. Create user
    const user = await authService.createUser({
      name,
      email,
      password,
    });
    

    // 4. generate otp
    const otp = await authService.generateOTP(email);

    // 5. send email
    await sendVerificationEmail(email, otp);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
