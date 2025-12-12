// scripts/clearUsers.ts
import mongoose from "mongoose"
import User from "../../models/user.model" // adjust path to your user.model

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studybuddy"

async function run() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    const result = await User.deleteMany({})
    console.log(`Deleted ${result.deletedCount} users`)

    await mongoose.disconnect()
    console.log("Disconnected")
  } catch (err) {
    console.error("Error clearing users:", err)
    process.exit(1)
  }
}

run()
