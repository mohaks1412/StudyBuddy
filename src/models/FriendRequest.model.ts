// models/friendRequest.model.ts
import { Schema, model, models, Types } from "mongoose"

export type FriendRequestStatus = "pending" | "accepted" | "rejected"

const FriendRequestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
)

// prevent duplicates while pending/accepted
FriendRequestSchema.index({ from: 1, to: 1 }, { unique: true })

export default models.FriendRequest ||
  model("FriendRequest", FriendRequestSchema)
