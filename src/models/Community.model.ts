
import mongoose, { Schema, Document, Model, model } from 'mongoose';
import type { Types } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description?: string;
  members: Types.ObjectId[] | string[]; 
  admins: Types.ObjectId[] | string[];
  createdAt: Date;
}

interface CommunityModel extends Model<ICommunity> {
  buildCommunity(args: Partial<ICommunity>): ICommunity;
}

const CommunitySchema = new Schema<ICommunity, CommunityModel>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

CommunitySchema.statics.buildCommunity = function(data: Pick<ICommunity, 'name' | 'slug' | 'description' | 'admins'>) {
  return new this(data) as ICommunity;
};

const Community =
  (mongoose.models.Community as CommunityModel) ||
  model<ICommunity, CommunityModel>('Community', CommunitySchema);

export default Community;