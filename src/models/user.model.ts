import mongoose, { Schema, Document } from "mongoose"
import { Types } from "mongoose"
export interface IUser extends Document {
  email: string
  password?: string
  username: string
  name: string
  isVerified: boolean
  college?: string | null
  major?: string | null
  bio?: string | null
  friends: Types.ObjectId[]  
  createdAt: Date
  updatedAt: Date
  community ?: Types.ObjectId[]
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    name: { type: String, required: true },
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    college: { type: String, default: null },
    major: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 500 },
      community: [{
        type: Schema.Types.ObjectId,
        ref: 'Community',
        default: [] 
      }]
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
