export type ItemCategory = 'ID Card' | 'Electronics' | 'Bottle' | 'Book' | 'Stationery' | 'Other';
export type ListingType = 'lost' | 'found';
export type ListingStatus = 'Open' | 'Claimed' | 'Resolved';
export type UserRole = 'student' | 'faculty' | 'admin';
export type ClaimStatus = 'pending' | 'accepted' | 'rejected';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface IListing {
  _id: string;
  type: ListingType;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  date: string; // ISO or date string
  imageUrl?: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  status: ListingStatus;
  userId: string;
  userName: string;
  userEmail: string;
  claimsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IClaim {
  _id: string;
  listingId: string;
  listingTitle: string;
  listingType: ListingType;
  listingImageUrl?: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  posterId: string;
  claimType: 'Claim' | 'This is Mine';
  message: string;
  proofDetails?: string;
  status: ClaimStatus;
  responseNote?: string;
  createdAt: string;
  updatedAt?: string;
}
