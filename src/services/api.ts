import { IUser, IListing, IClaim, ItemCategory, ListingStatus, ListingType } from '../../server/models/types.js';

const TOKEN_KEY = 'campus_lf_token';
const USER_KEY = 'campus_lf_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): IUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: IUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token invalid, clear
    authStorage.clear();
  }

  return response;
}

export const api = {
  // --- AUTH ---
  async signup(data: { name: string; email: string; password: string; role?: string; phone?: string }) {
    const res = await fetchWithAuth('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Signup failed');
    authStorage.setToken(json.token);
    authStorage.setUser(json.user);
    return json;
  },

  async login(data: { email: string; password: string }) {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    authStorage.setToken(json.token);
    authStorage.setUser(json.user);
    return json;
  },

  async demoLogin(role: 'student' | 'admin' | 'student2') {
    const res = await fetchWithAuth('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Demo login failed');
    authStorage.setToken(json.token);
    authStorage.setUser(json.user);
    return json;
  },

  async getCurrentUser(): Promise<IUser | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) return null;
      const json = await res.json();
      authStorage.setUser(json.user);
      return json.user;
    } catch {
      return null;
    }
  },

  logout(): void {
    authStorage.clear();
  },

  // --- LISTINGS ---
  async getListings(params: {
    search?: string;
    category?: string;
    status?: string;
    type?: string;
    userId?: string;
    sort?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.userId) query.set('userId', params.userId);
    if (params.sort) query.set('sort', params.sort);

    const res = await fetchWithAuth(`/api/listings?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch listings');
    return json as { listings: IListing[]; total: number };
  },

  async getListingById(id: string): Promise<IListing> {
    const res = await fetchWithAuth(`/api/listings/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Listing not found');
    return json.listing;
  },

  async createListing(data: {
    type: ListingType;
    title: string;
    description: string;
    category: ItemCategory;
    location: string;
    date: string;
    imageUrl?: string;
    contactInfo: { name: string; email: string; phone?: string };
  }) {
    const res = await fetchWithAuth('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create listing');
    return json.listing as IListing;
  },

  async updateListing(id: string, data: Partial<IListing>) {
    const res = await fetchWithAuth(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update listing');
    return json.listing as IListing;
  },

  async updateListingStatus(id: string, status: ListingStatus) {
    const res = await fetchWithAuth(`/api/listings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update status');
    return json.listing as IListing;
  },

  async deleteListing(id: string) {
    const res = await fetchWithAuth(`/api/listings/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete listing');
    return json;
  },

  // --- CLAIMS ---
  async submitClaim(data: {
    listingId: string;
    message: string;
    proofDetails?: string;
    claimantPhone?: string;
  }) {
    const res = await fetchWithAuth('/api/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit claim');
    return json.claim as IClaim;
  },

  async getMyClaims() {
    const res = await fetchWithAuth('/api/claims/my-claims');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch claims');
    return json.claims as IClaim[];
  },

  async getReceivedClaims() {
    const res = await fetchWithAuth('/api/claims/received');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch received claims');
    return json.claims as IClaim[];
  },

  async updateClaimStatus(claimId: string, status: 'accepted' | 'rejected', responseNote?: string) {
    const res = await fetchWithAuth(`/api/claims/${claimId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseNote }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update claim');
    return json as { claim: IClaim; listing?: IListing };
  },

  // --- ADMIN ---
  async getAdminStats() {
    const res = await fetchWithAuth('/api/admin/stats');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch admin stats');
    return json.stats;
  },

  async getAdminListings(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params);
    const res = await fetchWithAuth(`/api/admin/listings?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch admin listings');
    return json;
  },

  async getAdminUsers() {
    const res = await fetchWithAuth('/api/admin/users');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch users');
    return json.users as IUser[];
  },

  async autoResolveOld(days: number) {
    const res = await fetchWithAuth('/api/admin/auto-resolve', {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to execute auto resolve');
    return json;
  },

  async adminDeleteListing(id: string) {
    const res = await fetchWithAuth(`/api/admin/listings/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete listing');
    return json;
  },

  // --- FILE UPLOAD ---
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetchWithAuth('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload image');
    return json.imageUrl;
  },

  // --- RESET SEED ---
  async resetSeed() {
    const res = await fetchWithAuth('/api/seed', {
      method: 'POST',
    });
    return res.json();
  },
};
