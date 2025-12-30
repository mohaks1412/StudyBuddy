import mongoose, { Schema } from "mongoose"

const docPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  summary: String, 
  fileUrl: { type: String, required: true },
  type: { type: String, enum: ["question-paper", "notes"], required: true },
  subject: String,
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    default: null  
  }
}, { timestamps: true })

export default mongoose.models.DocPost || mongoose.model("DocPost", docPostSchema)
