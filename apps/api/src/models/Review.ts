import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewMedia {
  type: 'image' | 'video';
  url: string;
}

export interface IReview extends Document {
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  media: IReviewMedia[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: String, ref: 'Product', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, required: true },
    media: [
      {
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        url: { type: String, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
