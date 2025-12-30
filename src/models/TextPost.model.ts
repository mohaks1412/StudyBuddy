import mongoose, {Schema} from "mongoose"

const textPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true, maxlength: 10000 }, 
  type: { 
    type: String, 
    enum: ["question", "answer"], 
    required: true 
  },
  subject: String,
  associate: [{ type: mongoose.Schema.Types.ObjectId, ref: "TextPost" }],
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    default: null  // Global posts = null
  }
}, { timestamps: true })

export default mongoose.models.TextPost || mongoose.model("TextPost", textPostSchema)
