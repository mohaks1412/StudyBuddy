import mongoose from "mongoose"

const docPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  summary: String, // Optional description
  fileUrl: { type: String, required: true }, // PDF/DOC link
  type: { type: String, enum: ["question-paper", "notes"], required: true },
  subject: String,
  community: { type: String, default: null },
}, { timestamps: true })

export default mongoose.models.DocPost || mongoose.model("DocPost", docPostSchema)
