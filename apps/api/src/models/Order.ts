import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  quantity: number;
  price: number;
  size: string;
  image: string;
  userImage?: string;
  customScaleX?: number;
  customScaleY?: number;
  customX?: number;
  customY?: number;
  instructions?: string;
}

export interface IOrder extends Document {
  orderId?: string;
  user?: mongoose.Types.ObjectId; // Optional for guest checkout
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone?: string;
    email?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  isReturned: boolean;
  returnedAt?: Date;
  cancelledAt?: Date;
  status: string;
  proofMedia?: string[];
  actionReason?: string;
  actionNotes?: string;
  adminRejectionReason?: string;
  expectedReplacementDate?: string;
  actionRequestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    orderItems: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        image: { type: String, required: true },
        userImage: { type: String },
        customScaleX: { type: Number },
        customScaleY: { type: Number },
        customX: { type: Number },
        customY: { type: Number },
        instructions: { type: String },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String },
      email: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    isReturned: { type: Boolean, required: true, default: false },
    returnedAt: { type: Date },
    status: { type: String, default: 'Pending' },
    proofMedia: [{ type: String }],
    actionReason: { type: String },
    actionNotes: { type: String },
    adminRejectionReason: { type: String },
    expectedReplacementDate: { type: String },
    actionRequestedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
