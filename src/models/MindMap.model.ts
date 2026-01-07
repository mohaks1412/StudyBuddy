// models/MindMap.model.ts
import mongoose, { Schema, model, Document } from 'mongoose';
import { Link, Node } from '@/app/types/mindmap';

export interface MindMapDoc extends Document {
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  subject: string
  summary: string;
  level: string;
  nodes: Node[];
  links: Link[];
  createdAt: Date;
  updatedAt: Date;
  community: mongoose.Types.ObjectId;
}

const MindMapLinkSchema = new Schema<Link>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
  },
  { _id: false }
);

const MindMapNodeSchema = new Schema<Node>({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true, trim: true },
  summary: { type: String, trim: true, default: "" },
  description: { type: String, default: '' },
  children: [{ type: String }],
  
    level: {type: Number, required: true, min: 0}
}, { _id: false });

const MindMapSchema = new Schema<MindMapDoc>({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {type: String, default : "mind-map"},
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  
  nodes: [MindMapNodeSchema],
  links: [MindMapLinkSchema],
  community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      default: null  // Global posts = null
    },
}, {
  timestamps: true
});


const MindMap = mongoose.models.MindMap || model<MindMapDoc>('MindMap', MindMapSchema);

export default MindMap;
