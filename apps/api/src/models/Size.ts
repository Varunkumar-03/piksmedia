import mongoose, { Document, Schema } from 'mongoose';

export interface ISize extends Document {
  name: string;
  unit: string;
}

const SizeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    unit: { type: String, enum: ['inches(in)', 'centimeters(cm)', 'feet(ft)'], default: 'inches(in)' }
  },
  { timestamps: true }
);

export default mongoose.models.Size || mongoose.model<ISize>('Size', SizeSchema);
