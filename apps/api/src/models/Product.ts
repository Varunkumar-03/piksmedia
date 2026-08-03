import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isCustomizable: boolean;
  variants: {
    size: string;
    material: string;
    color: string;
    price: number;
  }[];
  isFeatured: boolean;
  averageRating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
  sizeChart?: string;
  mockup?: boolean;
  mockupImage?: string;
  deliveryCharges?: number;
  freeShippingThreshold?: number;
  returnDays?: boolean;
  replacementDays?: boolean;
  tag?: string;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: false },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    isCustomizable: { type: Boolean, default: false },
    variants: [
      {
        size: { type: String },
        material: { type: String },
        color: { type: String },
        price: { type: Number, default: 0 },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    selectedSizes: [{ type: String }],
    sizeChart: { type: String },
    mockup: { type: Boolean, default: false },
    mockupImage: { type: String },
    deliveryCharges: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    returnDays: { type: Boolean, default: false },
    replacementDays: { type: Boolean, default: false },
    tag: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
