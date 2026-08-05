import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  sessionId: string;
  hasPurchased: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    hasPurchased: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
