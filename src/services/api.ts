import { IUser, IListing, IClaim, ItemCategory, ListingStatus, ListingType } from '../types.ts';
import { ClientDataStore } from './clientDataStore.ts';
import { safeStorage } from '../utils/safeStorage.ts';

const TOKEN_KEY = 'campus_lf_token';
const USER_KEY = 'campus_lf_user';

export const authStorage = {
  getToken(): string | null {
    return safeStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    safeStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): IUser | null {
    const raw = safeStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: IUser): void {
    safeStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    safeStorage.removeItem(TOKEN_KEY);
    safeStorage.removeItem(USER_KEY);
  },
};

let isStaticMode = false;

export function getIsStaticMode(): boolean {
  return isStaticMode;
}

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
    authStorage.clear();
  }

  return response;
}

async function safeFetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (isStaticMode) {
    throw new Error('STATIC_MODE_FALLBACK');
  }

  try {
    const res = await fetchWithAuth(url, options);
    const contentType = res.headers.get('content-type') || '';

    // If server returned HTML (e.g. 404 or index.html SPA catch-all on static hosts), fallback
    if (!contentType.includes('application/json')) {
      isStaticMode = true;
      throw new Error('STATIC_MODE_FALLBACK');
    }

    const json = await res.json();
    if (!res.ok) {
      if (res.status === 400 || res.status === 409 || res.status === 403 || res.status === 401) {
        throw new Error(json.error || 'Request failed');
      }
      if (res.status === 404 && !url.includes('/api/listings/')) {
        isStaticMode = true;
        throw new Error('STATIC_MODE_FALLBACK');
      }
      throw new Error(json.error || 'Server error');
    }
    return json as T;
  } catch (err: any) {
    if (err.message === 'STATIC_MODE_FALLBACK' || err.name === 'TypeError') {
      isStaticMode = true;
      throw new Error('STATIC_MODE_FALLBACK');
    }
    throw err;
  }
}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export const api = {
  // --- AUTH ---
  async signup(data: { name: string; email: string; password: string; role?: string; phone?: string }) {
    try {
      const json = await safeFetchJson<{ token: string; user: IUser }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      authStorage.setToken(json.token);
      authStorage.setUser(json.user);
      return json;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        const result = ClientDataStore.signup(data);
        authStorage.setToken(result.token);
        authStorage.setUser(result.user);
        return result;
      }
      throw err;
    }
  },

  async login(data: { email: string; password: string }) {
    try {
      const json = await safeFetchJson<{ token: string; user: IUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      authStorage.setToken(json.token);
      authStorage.setUser(json.user);
      return json;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        const result = ClientDataStore.login(data.email, data.password);
        authStorage.setToken(result.token);
        authStorage.setUser(result.user);
        return result;
      }
      throw err;
    }
  },

  async demoLogin(role: 'student' | 'admin' | 'student2') {
    try {
      const json = await safeFetchJson<{ token: string; user: IUser }>('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      authStorage.setToken(json.token);
      authStorage.setUser(json.user);
      return json;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        const result = ClientDataStore.demoLogin(role);
        authStorage.setToken(result.token);
        authStorage.setUser(result.user);
        return result;
      }
      throw err;
    }
  },

  async getCurrentUser(): Promise<IUser | null> {
    const token = authStorage.getToken();
    if (!token) return null;

    try {
      const json = await safeFetchJson<{ user: IUser }>('/api/auth/me');
      authStorage.setUser(json.user);
      return json.user;
    } catch {
      // In static / fallback mode, read from localStorage
      return authStorage.getUser();
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

    try {
      const json = await safeFetchJson<{ listings: IListing[]; total: number }>(`/api/listings?${query.toString()}`);
      return json;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.queryListings(params);
      }
      throw err;
    }
  },

  async getListingById(id: string): Promise<IListing> {
    try {
      const json = await safeFetchJson<{ listing: IListing }>(`/api/listings/${id}`);
      return json.listing;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.getListingById(id);
      }
      throw err;
    }
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
    try {
      const json = await safeFetchJson<{ listing: IListing }>('/api/listings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return json.listing;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        let user = authStorage.getUser();
        if (!user) {
          user = {
            _id: 'usr_guest',
            name: data.contactInfo.name || 'Campus Student',
            email: data.contactInfo.email || 'student@campus.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
          };
        }
        return ClientDataStore.createListing(user, data);
      }
      throw err;
    }
  },

  async updateListing(id: string, data: Partial<IListing>) {
    try {
      const json = await safeFetchJson<{ listing: IListing }>(`/api/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return json.listing;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.updateListing(id, data);
      }
      throw err;
    }
  },

  async updateListingStatus(id: string, status: ListingStatus) {
    try {
      const json = await safeFetchJson<{ listing: IListing }>(`/api/listings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return json.listing;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.updateListing(id, { status });
      }
      throw err;
    }
  },

  async deleteListing(id: string) {
    try {
      return await safeFetchJson(`/api/listings/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        ClientDataStore.deleteListing(id);
        return { message: 'Listing deleted successfully' };
      }
      throw err;
    }
  },

  // --- CLAIMS ---
  async submitClaim(data: {
    listingId: string;
    message: string;
    proofDetails?: string;
    claimantPhone?: string;
  }) {
    try {
      const json = await safeFetchJson<{ claim: IClaim }>('/api/claims', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return json.claim;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        let user = authStorage.getUser();
        if (!user) {
          user = {
            _id: 'usr_guest',
            name: 'Campus Member',
            email: 'claimant@campus.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
          };
        }
        return ClientDataStore.submitClaim(user, data);
      }
      throw err;
    }
  },

  async getMyClaims() {
    try {
      const json = await safeFetchJson<{ claims: IClaim[] }>('/api/claims/my-claims');
      return json.claims;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        const user = authStorage.getUser();
        if (!user) return [];
        return ClientDataStore.getMyClaims(user._id);
      }
      throw err;
    }
  },

  async getReceivedClaims() {
    try {
      const json = await safeFetchJson<{ claims: IClaim[] }>('/api/claims/received');
      return json.claims;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        const user = authStorage.getUser();
        if (!user) return [];
        return ClientDataStore.getReceivedClaims(user._id);
      }
      throw err;
    }
  },

  async updateClaimStatus(claimId: string, status: 'accepted' | 'rejected', responseNote?: string) {
    try {
      return await safeFetchJson<{ claim: IClaim; listing?: IListing }>(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, responseNote }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.updateClaimStatus(claimId, status, responseNote);
      }
      throw err;
    }
  },

  // --- ADMIN ---
  async getAdminStats() {
    try {
      const json = await safeFetchJson<{ stats: any }>('/api/admin/stats');
      return json.stats;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.getAdminStats();
      }
      throw err;
    }
  },

  async getAdminListings(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params);
    try {
      return await safeFetchJson(`/api/admin/listings?${query.toString()}`);
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        const res = ClientDataStore.queryListings(params);
        return { listings: res.listings, total: res.total, totalPages: 1 };
      }
      throw err;
    }
  },

  async getAdminUsers() {
    try {
      const json = await safeFetchJson<{ users: IUser[] }>('/api/admin/users');
      return json.users;
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.getAllUsers();
      }
      throw err;
    }
  },

  async autoResolveOld(days: number) {
    try {
      return await safeFetchJson('/api/admin/auto-resolve', {
        method: 'POST',
        body: JSON.stringify({ days }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        return ClientDataStore.autoResolveOld(days);
      }
      throw err;
    }
  },

  async adminDeleteListing(id: string) {
    try {
      return await safeFetchJson(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'STATIC_MODE_FALLBACK') {
        ClientDataStore.deleteListing(id);
        return { message: 'Listing deleted' };
      }
      throw err;
    }
  },

  // --- FILE UPLOAD ---
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('STATIC_FALLBACK');
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to upload image');
      return json.imageUrl;
    } catch {
      // In static / client mode or if server upload failed, generate a base64 data URL
      return await convertFileToBase64(file);
    }
  },

  // --- RESET SEED ---
  async resetSeed() {
    try {
      return await safeFetchJson('/api/seed', { method: 'POST' });
    } catch {
      ClientDataStore.resetToSeed();
      return { message: 'Reset to sample seed data in client storage' };
    }
  },
};
