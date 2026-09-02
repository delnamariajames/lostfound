import { IUser, IListing, IClaim, ItemCategory, ListingStatus, ListingType } from '../../server/models/types.js';

const CLIENT_USERS_KEY = 'campus_lf_client_users_v1';
const CLIENT_LISTINGS_KEY = 'campus_lf_client_listings_v1';
const CLIENT_CLAIMS_KEY = 'campus_lf_client_claims_v1';

export const INITIAL_CLIENT_USERS: IUser[] = [
  {
    _id: 'usr_admin_01',
    name: 'Campus Admin (Officer Vance)',
    email: 'admin@campus.edu',
    role: 'admin',
    phone: '(555) 019-2831',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'usr_student_01',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    phone: '(555) 012-3456',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'usr_student_02',
    name: 'Sarah Chen',
    email: 'sarah.chen@campus.edu',
    role: 'student',
    phone: '(555) 018-7744',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'usr_faculty_01',
    name: 'Prof. Marcus Vance',
    email: 'm.vance@campus.edu',
    role: 'faculty',
    phone: '(555) 014-9988',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_CLIENT_LISTINGS: IListing[] = [
  {
    _id: 'lst_01',
    type: 'found',
    title: 'Student ID Card - Emily Johnson (CS Dept)',
    description: 'Found a student ID card on table 4 at the 2nd floor Main Library quiet study area. Left it temporarily with the 1st floor front security desk.',
    category: 'ID Card',
    location: 'Main Library 2nd Floor (Quiet Study)',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    contactInfo: {
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      phone: '(555) 012-3456',
    },
    status: 'Open',
    userId: 'usr_student_01',
    userName: 'Alex Rivera',
    userEmail: 'alex.rivera@campus.edu',
    claimsCount: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lst_02',
    type: 'lost',
    title: 'Silver 14" MacBook Pro in Gray Incase Sleeve',
    description: 'Left on the wooden bench outside Room 302 after CS301 Operating Systems lecture. Contains all my thesis notes and key stickers on the back cover (NASA & Python).',
    category: 'Electronics',
    location: 'Engineering Building Hall 3, Room 302',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    contactInfo: {
      name: 'Sarah Chen',
      email: 'sarah.chen@campus.edu',
      phone: '(555) 018-7744',
    },
    status: 'Open',
    userId: 'usr_student_02',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@campus.edu',
    claimsCount: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lst_03',
    type: 'found',
    title: 'Navy Blue 32oz Hydro Flask with National Park Stickers',
    description: 'Found on the bleachers near the basketball court after the intramural game. Has a black straw lid and Yosemite sticker.',
    category: 'Bottle',
    location: 'Campus Recreation Center (Gym Bleachers)',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    contactInfo: {
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      phone: '(555) 012-3456',
    },
    status: 'Open',
    userId: 'usr_student_01',
    userName: 'Alex Rivera',
    userEmail: 'alex.rivera@campus.edu',
    claimsCount: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lst_04',
    type: 'lost',
    title: 'Calculus: Early Transcendentals (8th Ed) + Class Binder',
    description: 'Hardcover textbook with green sticky notes inside chapters 4 & 5. Left in the back row of Science Hall auditorium 101.',
    category: 'Book',
    location: 'Science Hall - Lecture Hall 101',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    contactInfo: {
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      phone: '(555) 012-3456',
    },
    status: 'Claimed',
    userId: 'usr_student_01',
    userName: 'Alex Rivera',
    userEmail: 'alex.rivera@campus.edu',
    claimsCount: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lst_05',
    type: 'found',
    title: 'Matte Black Apple AirPods Pro (2nd Gen) in Lanyard Case',
    description: 'Found under the round booth seat near the juice bar in the student cafeteria. Brought to campus info desk.',
    category: 'Electronics',
    location: 'Student Union Cafeteria (Juice Bar corner)',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    contactInfo: {
      name: 'Sarah Chen',
      email: 'sarah.chen@campus.edu',
      phone: '(555) 018-7744',
    },
    status: 'Resolved',
    userId: 'usr_student_02',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@campus.edu',
    claimsCount: 2,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'lst_06',
    type: 'found',
    title: 'TI-84 Plus CE Graphing Calculator (Rose Gold)',
    description: 'Found on the podium desk in Math Hall 204 after Calculus II exam.',
    category: 'Stationery',
    location: 'Math & Sciences Complex - Room 204',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
    contactInfo: {
      name: 'Prof. Marcus Vance',
      email: 'm.vance@campus.edu',
      phone: '(555) 014-9988',
    },
    status: 'Open',
    userId: 'usr_faculty_01',
    userName: 'Prof. Marcus Vance',
    userEmail: 'm.vance@campus.edu',
    claimsCount: 0,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_CLIENT_CLAIMS: IClaim[] = [
  {
    _id: 'clm_01',
    listingId: 'lst_01',
    listingTitle: 'Student ID Card - Emily Johnson (CS Dept)',
    listingType: 'found',
    listingImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    claimantId: 'usr_student_02',
    claimantName: 'Sarah Chen',
    claimantEmail: 'sarah.chen@campus.edu',
    claimantPhone: '(555) 018-7744',
    posterId: 'usr_student_01',
    claimType: 'This is Mine',
    message: 'Emily is my lab partner and I can verify her student ID number ending in 8492. Can I pick it up?',
    proofDetails: 'Student ID ends in 8492, CS Sophomore. I have her class schedule to confirm.',
    status: 'pending',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'clm_02',
    listingId: 'lst_02',
    listingTitle: 'Silver 14" MacBook Pro in Gray Incase Sleeve',
    listingType: 'lost',
    listingImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    claimantId: 'usr_student_01',
    claimantName: 'Alex Rivera',
    claimantEmail: 'alex.rivera@campus.edu',
    claimantPhone: '(555) 012-3456',
    posterId: 'usr_student_02',
    claimType: 'Claim',
    message: 'Hey Sarah, I think I saw someone turn a laptop matching this into the Engineering Lab front office on Floor 2!',
    proofDetails: 'Spoke with lab tech Dave at 4 PM who has it in the safe.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export class ClientDataStore {
  private static getUsers(): IUser[] {
    const raw = localStorage.getItem(CLIENT_USERS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_USERS_KEY, JSON.stringify(INITIAL_CLIENT_USERS));
      return INITIAL_CLIENT_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENT_USERS;
    }
  }

  private static setUsers(users: IUser[]): void {
    localStorage.setItem(CLIENT_USERS_KEY, JSON.stringify(users));
  }

  private static getListings(): IListing[] {
    const raw = localStorage.getItem(CLIENT_LISTINGS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_LISTINGS_KEY, JSON.stringify(INITIAL_CLIENT_LISTINGS));
      return INITIAL_CLIENT_LISTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENT_LISTINGS;
    }
  }

  private static setListings(listings: IListing[]): void {
    localStorage.setItem(CLIENT_LISTINGS_KEY, JSON.stringify(listings));
  }

  private static getClaims(): IClaim[] {
    const raw = localStorage.getItem(CLIENT_CLAIMS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_CLAIMS_KEY, JSON.stringify(INITIAL_CLIENT_CLAIMS));
      return INITIAL_CLIENT_CLAIMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENT_CLAIMS;
    }
  }

  private static setClaims(claims: IClaim[]): void {
    localStorage.setItem(CLIENT_CLAIMS_KEY, JSON.stringify(claims));
  }

  public static resetToSeed(): void {
    localStorage.setItem(CLIENT_USERS_KEY, JSON.stringify(INITIAL_CLIENT_USERS));
    localStorage.setItem(CLIENT_LISTINGS_KEY, JSON.stringify(INITIAL_CLIENT_LISTINGS));
    localStorage.setItem(CLIENT_CLAIMS_KEY, JSON.stringify(INITIAL_CLIENT_CLAIMS));
  }

  // --- AUTH ---
  public static login(email: string, _pass: string) {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) throw new Error('Invalid email or password');
    const token = `client_jwt_${user._id}_${Date.now()}`;
    return { token, user };
  }

  public static signup(data: { name: string; email: string; password: string; role?: string; phone?: string }) {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      throw new Error('An account with this email already exists');
    }
    const newUser: IUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: (data.role as any) || 'student',
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };
    users.push(newUser);
    this.setUsers(users);
    const token = `client_jwt_${newUser._id}_${Date.now()}`;
    return { token, user: newUser };
  }

  public static demoLogin(role: 'student' | 'admin' | 'student2') {
    const users = this.getUsers();
    let target = users.find((u) => u.role === (role === 'student2' ? 'student' : role));
    if (role === 'student2') {
      target = users.find((u) => u._id === 'usr_student_02') || target;
    }
    if (!target) target = users[0];
    const token = `client_jwt_${target._id}_${Date.now()}`;
    return { token, user: target };
  }

  public static findUserById(id: string): IUser | null {
    const users = this.getUsers();
    return users.find((u) => u._id === id) || null;
  }

  // --- LISTINGS ---
  public static queryListings(params: {
    search?: string;
    category?: string;
    status?: string;
    type?: string;
    userId?: string;
    sort?: string;
  } = {}) {
    let list = [...this.getListings()];

    if (params.type && params.type !== 'all') {
      list = list.filter((item) => item.type === params.type);
    }
    if (params.category && params.category !== 'all') {
      list = list.filter((item) => item.category === params.category);
    }
    if (params.status && params.status !== 'all') {
      list = list.filter((item) => item.status === params.status);
    }
    if (params.userId) {
      list = list.filter((item) => item.userId === params.userId);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    if (params.sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return { listings: list, total: list.length };
  }

  public static getListingById(id: string): IListing {
    const listings = this.getListings();
    const item = listings.find((l) => l._id === id);
    if (!item) throw new Error('Listing not found');
    return item;
  }

  public static createListing(
    user: IUser,
    data: {
      type: ListingType;
      title: string;
      description: string;
      category: ItemCategory;
      location: string;
      date: string;
      imageUrl?: string;
      contactInfo: { name: string; email: string; phone?: string };
    }
  ): IListing {
    const listings = this.getListings();
    const newListing: IListing = {
      _id: `lst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      status: 'Open',
      claimsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    listings.unshift(newListing);
    this.setListings(listings);
    return newListing;
  }

  public static updateListing(id: string, data: Partial<IListing>): IListing {
    const listings = this.getListings();
    const idx = listings.findIndex((l) => l._id === id);
    if (idx === -1) throw new Error('Listing not found');
    const updated = {
      ...listings[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    listings[idx] = updated;
    this.setListings(listings);
    return updated;
  }

  public static deleteListing(id: string): void {
    let listings = this.getListings();
    listings = listings.filter((l) => l._id !== id);
    this.setListings(listings);
    let claims = this.getClaims();
    claims = claims.filter((c) => c.listingId !== id);
    this.setClaims(claims);
  }

  // --- CLAIMS ---
  public static submitClaim(
    user: IUser,
    data: {
      listingId: string;
      message: string;
      proofDetails?: string;
      claimantPhone?: string;
    }
  ): IClaim {
    const listing = this.getListingById(data.listingId);
    const claims = this.getClaims();

    const newClaim: IClaim = {
      _id: `clm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      listingId: listing._id,
      listingTitle: listing.title,
      listingType: listing.type,
      listingImageUrl: listing.imageUrl,
      claimantId: user._id,
      claimantName: user.name,
      claimantEmail: user.email,
      claimantPhone: data.claimantPhone || user.phone || '',
      posterId: listing.userId,
      claimType: listing.type === 'found' ? 'This is Mine' : 'Claim',
      message: data.message,
      proofDetails: data.proofDetails || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    claims.unshift(newClaim);
    this.setClaims(claims);

    this.updateListing(listing._id, { claimsCount: (listing.claimsCount || 0) + 1 });
    return newClaim;
  }

  public static getMyClaims(userId: string): IClaim[] {
    const claims = this.getClaims();
    return claims.filter((c) => c.claimantId === userId);
  }

  public static getReceivedClaims(userId: string): IClaim[] {
    const claims = this.getClaims();
    return claims.filter((c) => c.posterId === userId);
  }

  public static updateClaimStatus(
    claimId: string,
    status: 'accepted' | 'rejected',
    responseNote?: string
  ): { claim: IClaim; listing?: IListing } {
    const claims = this.getClaims();
    const idx = claims.findIndex((c) => c._id === claimId);
    if (idx === -1) throw new Error('Claim not found');

    const updatedClaim: IClaim = {
      ...claims[idx],
      status,
      responseNote: responseNote || claims[idx].responseNote,
      updatedAt: new Date().toISOString(),
    };
    claims[idx] = updatedClaim;
    this.setClaims(claims);

    let updatedListing: IListing | undefined;
    if (status === 'accepted') {
      try {
        updatedListing = this.updateListing(updatedClaim.listingId, { status: 'Claimed' });
      } catch {
        // ignore
      }
    }
    return { claim: updatedClaim, listing: updatedListing };
  }

  // --- ADMIN ---
  public static getAdminStats() {
    const listings = this.getListings();
    const claims = this.getClaims();
    const users = this.getUsers();

    const totalLost = listings.filter((l) => l.type === 'lost').length;
    const totalFound = listings.filter((l) => l.type === 'found').length;
    const resolved = listings.filter((l) => l.status === 'Resolved').length;
    const claimed = listings.filter((l) => l.status === 'Claimed').length;
    const open = listings.filter((l) => l.status === 'Open').length;

    const categoriesCount = listings.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalListings: listings.length,
      totalLost,
      totalFound,
      totalClaims: claims.length,
      resolvedCount: resolved,
      claimedCount: claimed,
      openCount: open,
      resolutionRate: listings.length > 0 ? Math.round(((resolved + claimed) / listings.length) * 100) : 0,
      totalUsers: users.length,
      categoriesCount,
    };
  }

  public static getAllUsers(): IUser[] {
    return this.getUsers();
  }

  public static autoResolveOld(days: number): { modifiedCount: number } {
    const listings = this.getListings();
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let count = 0;

    const updated = listings.map((item) => {
      if (item.status === 'Open' && new Date(item.createdAt) < cutoffDate) {
        count++;
        return {
          ...item,
          status: 'Resolved' as ListingStatus,
          description: `${item.description} [Auto-archived by Campus Safety after ${days} days inactivity]`,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    this.setListings(updated);
    return { modifiedCount: count };
  }
}
