// models/Message.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import User from "./user.model"
export interface IMedia {
  url: string;
  type: "image" | "video" | "document" | "audio";
  name?: string;
  size?: number;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content?: string;
  media?: IMedia;
  createdAt: Date;
  unread: Boolean
}

const MediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video", "document", "audio"],
      required: true,
    },
    name: { type: String, maxlength: 255 },
    size: { type: Number },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    media: {
      type: MediaSchema,
      required: false,
    },
    unread: { 
      type: Boolean, 
      default: true
    }
  },
  { timestamps: true }
);


MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
