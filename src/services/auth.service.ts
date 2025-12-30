import bcrypt from "bcryptjs";
import UserModel, { IUser } from "../models/user.model";
import dbConnect from "@/lib/dbConnect";
import { otpStorage } from "@/lib/otp-store";
import { string } from "zod";
import { log } from "util";

class AuthService {
  async findUserByEmailOrUsername(identifier: string): Promise<IUser | null> {
    await dbConnect();

    return UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
  }

  async findUserById(userId: string): Promise<IUser | null> {
    await dbConnect()
    
    const user = await UserModel.findById(userId).lean<IUser | null>()
    console.log(user);
    
    return user
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async loginWithCredentials(identifier: string, password: string): Promise<IUser> {
    await dbConnect();

    const user = await this.findUserByEmailOrUsername(identifier);

    if (!user) {
      throw new Error("No user found with this email or username");
    }

    if (!user.isVerified) {
      throw new Error("Please verify your account first");
    }

    const isCorrect = await this.verifyPassword(password, user.password!);

    if (!isCorrect) {
      throw new Error("Invalid password");
    }

    return user;
  }


    generateBaseName(name: string) {
        return name
        .toLowerCase()
        .replace(/\s+/g, "")       
        .replace(/[^a-z0-9]/g, ""); 
        
    }

    async generateUniqueUsername(name: string): Promise<string> {
        const base = this.generateBaseName(name);

        const users = await UserModel.find(
            { username: new RegExp(`^${base}\\d*$`, "i") },
            { username: 1, _id: 0 }
        );

        if (users.length === 0) {
            return `${base}1`;
        }

        const numbers = users
            .map((u) => {
            const match = u.username.match(new RegExp(`^${base}(\\d+)$`, "i"));
            return match ? parseInt(match[1], 10) : null;
            })
            .filter((n): n is number => n !== null);

        const max = numbers.length ? Math.max(...numbers) : 0;

        return `${base}${max + 1}`;
    }

    async createUser(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<IUser> {
        await dbConnect();

        const hashed = await this.hashPassword(data.password);
        const username = await this.generateUniqueUsername(data.name);
        const user = await UserModel.create({
        ...data,
        username,
        password: hashed,
        isVerified: false,
        });

        return user;
    }
    async generateOTP(email : string): Promise<string> {
      const otp: string = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
      await otpStorage.set(email, otp)
      return otp;
    }
    
    async verifyOTP(email: string, otp: string): Promise<boolean> {
      await dbConnect(); 

      const storedOtp = await otpStorage.get(email)

      
      if (!storedOtp) {
        throw new Error("OTP expired or not found");
      }
      
      if (storedOtp.toString() !== otp.toString()) {
        throw new Error("Invalid OTP");
      }

      await otpStorage.delete(email);

      await UserModel.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      );

      return true;
    }


    async createSocialUser(data:{
      name: string,
      email: string
    }): Promise<IUser>{


      await dbConnect();

      const {name, email} = data;
      const username = await this.generateUniqueUsername(name);
      const user = await UserModel.create({
        ...data,
        username,
        password: null,
        isVerified: true,
      });

      return user;
    }

  async updateUser(
    id: string,
    data: Partial<Pick<IUser, "college" | "major" | "bio">>
  ): Promise<IUser | null> {
    await dbConnect()
    
    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(data.college !== undefined && { college: data.college }),
          ...(data.major !== undefined && { major: data.major }),
          ...(data.bio !== undefined && { bio: data.bio }),
        },
      },
      { new: true }
    ).lean<IUser | null>()
    return updated
  }

}   

const authService = new AuthService();
export default authService;
