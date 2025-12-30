import dotenv from 'dotenv'
import mongoose from "mongoose";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI!;

export default async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  console.log("Connect to database");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Mongo connected");
  } catch (err) {
    console.error("Mongo error:", err);
    throw err;
  }
}
