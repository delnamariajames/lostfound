import mongoose, { Schema } from 'mongoose';
import { IUser, IListing, IClaim } from './types.js';

// User Schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

// Listing Schema
const ListingSchema = new Schema<IListing>({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['ID Card', 'Electronics', 'Bottle', 'Book', 'Stationery', 'Other'], 
    required: true 
  },
  location: { type: String, required: true },
  date: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  contactInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
  },
  status: { type: String, enum: ['Open', 'Claimed', 'Resolved'], default: 'Open' },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  claimsCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

// Claim Schema
const ClaimSchema = new Schema<IClaim>({
  listingId: { type: String, required: true },
  listingTitle: { type: String, required: true },
  listingType: { type: String, enum: ['lost', 'found'], required: true },
  listingImageUrl: { type: String, default: '' },
  claimantId: { type: String, required: true },
  claimantName: { type: String, required: true },
  claimantEmail: { type: String, required: true },
  claimantPhone: { type: String, default: '' },
  posterId: { type: String, required: true },
  claimType: { type: String, enum: ['Claim', 'This is Mine'], required: true },
  message: { type: String, required: true },
  proofDetails: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  responseNote: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const ListingModel = mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
export const ClaimModel = mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);
