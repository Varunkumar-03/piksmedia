import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  badge?: string;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: { type: String },
    badge: { type: String, trim: true },
    availableSizes: [{ type: String }],
    sizeUnit: { type: String, enum: ['inches(in)', 'centimeters(cm)', 'feet(ft)'], default: 'inches(in)' },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
