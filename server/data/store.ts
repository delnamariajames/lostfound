import { IUser, IListing, IClaim, ItemCategory, ListingStatus, ListingType } from '../models/types.js';
import { SEED_USERS, SEED_LISTINGS, SEED_CLAIMS } from './seedData.js';
import { isDbConnected } from '../config/db.js';
import { UserModel, ListingModel, ClaimModel } from '../models/schemas.js';

class DataStore {
  private users: IUser[] = JSON.parse(JSON.stringify(SEED_USERS));
  private listings: IListing[] = JSON.parse(JSON.stringify(SEED_LISTINGS));
  private claims: IClaim[] = JSON.parse(JSON.stringify(SEED_CLAIMS));

  // Reset database to seed data
  public resetToSeed(): void {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.listings = JSON.parse(JSON.stringify(SEED_LISTINGS));
    this.claims = JSON.parse(JSON.stringify(SEED_CLAIMS));
  }

  // --- USER METHODS ---
  public async findUserByEmail(email: string): Promise<IUser | null> {
    if (isDbConnected()) {
      try {
        const user = await (UserModel as any).findOne({ email: email.toLowerCase().trim() }).lean();
        if (user) return user as unknown as IUser;
      } catch (err) {
        console.warn('Mongoose query failed, fallback to memory', err);
      }
    }
    const found = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    return found ? { ...found } : null;
  }

  public async findUserById(id: string): Promise<IUser | null> {
    if (isDbConnected()) {
      try {
        const user = await (UserModel as any).findById(id).lean();
        if (user) return user as unknown as IUser;
      } catch (err) {
        console.warn('Mongoose query failed, fallback to memory', err);
      }
    }
    const found = this.users.find((u) => u._id === id);
    return found ? { ...found } : null;
  }

  public async createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> {
    const newUser: IUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
      email: userData.email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const created = await UserModel.create(newUser);
        return created.toObject() as IUser;
      } catch (err) {
        console.warn('Mongoose create failed, using memory', err);
      }
    }

    this.users.push(newUser);
    return { ...newUser };
  }

  public async getAllUsers(): Promise<IUser[]> {
    if (isDbConnected()) {
      try {
        const list = await UserModel.find().select('-password').lean();
        if (list.length > 0) return list as unknown as IUser[];
      } catch (err) {
        console.warn('Mongoose query failed, fallback to memory', err);
      }
    }
    return this.users.map(({ password: _, ...rest }) => ({ ...rest } as IUser));
  }

  // --- LISTING METHODS ---
  public async getListings(params: {
    search?: string;
    category?: string;
    status?: string;
    type?: string;
    userId?: string;
    sort?: string;
  }): Promise<{ listings: IListing[]; total: number }> {
    let result = [...this.listings];

    if (params.type && params.type !== 'all') {
      result = result.filter((item) => item.type === params.type);
    }

    if (params.category && params.category !== 'all') {
      result = result.filter((item) => item.category === params.category);
    }

    if (params.status && params.status !== 'all') {
      result = result.filter((item) => item.status === params.status);
    }

    if (params.userId) {
      result = result.filter((item) => item.userId === params.userId);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (params.sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Default: most recent
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Update claim counts
    result = result.map((item) => {
      const claimCount = this.claims.filter((c) => c.listingId === item._id).length;
      return { ...item, claimsCount: claimCount };
    });

    return {
      listings: result,
      total: result.length,
    };
  }

  public async getListingById(id: string): Promise<IListing | null> {
    const item = this.listings.find((l) => l._id === id);
    if (!item) return null;
    const claimCount = this.claims.filter((c) => c.listingId === item._id).length;
    return { ...item, claimsCount: claimCount };
  }

  public async createListing(listingData: Omit<IListing, '_id' | 'createdAt' | 'updatedAt' | 'claimsCount'>): Promise<IListing> {
    const newListing: IListing = {
      _id: `lst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...listingData,
      claimsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const created = await ListingModel.create(newListing);
        return created.toObject() as IListing;
      } catch (err) {
        console.warn('Mongoose create listing failed, fallback to memory', err);
      }
    }

    this.listings.unshift(newListing);
    return { ...newListing };
  }

  public async updateListing(id: string, updates: Partial<IListing>): Promise<IListing | null> {
    const index = this.listings.findIndex((l) => l._id === id);
    if (index === -1) return null;

    const updated = {
      ...this.listings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.listings[index] = updated;

    if (isDbConnected()) {
      try {
        await (ListingModel as any).findByIdAndUpdate(id, updated);
      } catch (err) {
        console.warn('Mongoose update failed', err);
      }
    }

    return { ...updated };
  }

  public async deleteListing(id: string): Promise<boolean> {
    const index = this.listings.findIndex((l) => l._id === id);
    if (index === -1) return false;

    this.listings.splice(index, 1);
    // Also remove associated claims
    this.claims = this.claims.filter((c) => c.listingId !== id);

    if (isDbConnected()) {
      try {
        await (ListingModel as any).findByIdAndDelete(id);
        await (ClaimModel as any).deleteMany({ listingId: id });
      } catch (err) {
        console.warn('Mongoose delete failed', err);
      }
    }

    return true;
  }

  // Auto-resolve unresolved listings older than days
  public async autoResolveOldListings(daysThreshold: number = 30): Promise<{ resolvedCount: number }> {
    const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
    let resolvedCount = 0;

    for (let i = 0; i < this.listings.length; i++) {
      const item = this.listings[i];
      if (item.status === 'Open' && new Date(item.createdAt) <= cutoffDate) {
        this.listings[i] = {
          ...item,
          status: 'Resolved',
          updatedAt: new Date().toISOString(),
        };
        resolvedCount++;
      }
    }

    return { resolvedCount };
  }

  // --- CLAIM METHODS ---
  public async createClaim(claimData: Omit<IClaim, '_id' | 'createdAt' | 'status'>): Promise<IClaim> {
    const newClaim: IClaim = {
      _id: `clm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...claimData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.claims.unshift(newClaim);

    if (isDbConnected()) {
      try {
        await ClaimModel.create(newClaim);
      } catch (err) {
        console.warn('Mongoose create claim failed', err);
      }
    }

    return { ...newClaim };
  }

  public async getClaimsByPoster(posterId: string): Promise<IClaim[]> {
    return this.claims
      .filter((c) => c.posterId === posterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getClaimsByClaimant(claimantId: string): Promise<IClaim[]> {
    return this.claims
      .filter((c) => c.claimantId === claimantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getClaimById(id: string): Promise<IClaim | null> {
    const found = this.claims.find((c) => c._id === id);
    return found ? { ...found } : null;
  }

  public async updateClaimStatus(
    claimId: string, 
    status: 'accepted' | 'rejected', 
    responseNote?: string
  ): Promise<{ claim: IClaim; listing?: IListing } | null> {
    const claimIndex = this.claims.findIndex((c) => c._id === claimId);
    if (claimIndex === -1) return null;

    const claim = this.claims[claimIndex];
    claim.status = status;
    if (responseNote) claim.responseNote = responseNote;
    claim.updatedAt = new Date().toISOString();
    this.claims[claimIndex] = claim;

    let updatedListing: IListing | undefined;

    // If accepted, change listing status to 'Claimed'
    if (status === 'accepted') {
      const listingIndex = this.listings.findIndex((l) => l._id === claim.listingId);
      if (listingIndex !== -1) {
        this.listings[listingIndex].status = 'Claimed';
        this.listings[listingIndex].updatedAt = new Date().toISOString();
        updatedListing = this.listings[listingIndex];
      }
    }

    return { claim: { ...claim }, listing: updatedListing };
  }

  public async getAllClaims(): Promise<IClaim[]> {
    return [...this.claims].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const dbStore = new DataStore();
