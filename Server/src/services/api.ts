/**
 * Centralized API client for the ReWear backend.
 *
 * - Base URL from VITE_API_BASE_URL env var
 * - Automatically attaches JWT token from localStorage
 * - Typed response helpers
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get the stored JWT token.
 */
export function getToken(): string | null {
  return localStorage.getItem('rewear_token');
}

/**
 * Store a JWT token.
 */
export function setToken(token: string): void {
  localStorage.setItem('rewear_token', token);
}

/**
 * Remove the stored JWT token.
 */
export function clearToken(): void {
  localStorage.removeItem('rewear_token');
}

/**
 * Core fetch wrapper with auth header injection and JSON handling.
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse JSON (even for errors — our backend always returns JSON)
  const data = await response.json().catch(() => ({ message: 'Network error' }));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

// ── Auth API ────────────────────────────────────────────────

export interface AuthResponse {
  message: string;
  token: string;
  user: ApiUser;
}

export interface ApiUser {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar: string;
  location: string;
  bio: string;
  phone: string;
  status: 'active' | 'suspended';
  points: number;
  level: string;
  stats: {
    itemsListed: number;
    successfulSwaps: number;
    waterSaved: number;
    co2Reduced: number;
    itemsRescued: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  signup: (email: string, password: string, name?: string) =>
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string, role?: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  me: () => request<{ user: ApiUser }>('/api/auth/me'),
};

// ── Items API ───────────────────────────────────────────────

export interface ApiItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string;
  size: string;
  condition: string;
  color: string;
  brand: string;
  location: string;
  tags: string[];
  images: string[];
  seller: string;
  sellerInfo: {
    name: string;
    email: string;
    avatar: string;
    rating: number;
  };
  status: 'on-processing' | 'approved' | 'rejected';
  rejectionMessage: string;
  upvotes: number;
  upvotedBy: string[];
  views: number;
  isSeedData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  price: number | string;
  category: string;
  type?: string;
  size?: string;
  condition: string;
  color?: string;
  brand?: string;
  location?: string;
  tags?: string[];
  images: string[];
}

export const itemsApi = {
  getAll: (params?: { search?: string; category?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request<{ items: ApiItem[] }>(`/api/items${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<{ item: ApiItem }>(`/api/items/${id}`),

  create: (data: CreateItemPayload) =>
    request<{ message: string; item: ApiItem }>('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMy: () =>
    request<{ items: ApiItem[] }>('/api/items/my'),

  getPending: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<{ items: ApiItem[] }>(`/api/items/pending${qs}`);
  },

  approve: (id: string) =>
    request<{ message: string; item: ApiItem }>(`/api/items/${id}/approve`, {
      method: 'PUT',
    }),

  reject: (id: string, rejectionMessage: string) =>
    request<{ message: string; item: ApiItem }>(`/api/items/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionMessage }),
    }),

  upvote: (id: string) =>
    request<{ message: string; upvotes: number; hasUpvoted: boolean }>(
      `/api/items/${id}/upvote`,
      { method: 'POST' }
    ),
};

// ── Wishlist API ────────────────────────────────────────────

export interface WishlistItemResponse {
  id: string;
  title: string;
  image: string;
  price: string;
  brand: string;
  size: string;
  addedDate: string;
}

export const wishlistApi = {
  get: () =>
    request<{ items: WishlistItemResponse[] }>('/api/wishlist'),

  add: (itemId: string) =>
    request<{ message: string }>(`/api/wishlist/${itemId}`, {
      method: 'POST',
    }),

  remove: (itemId: string) =>
    request<{ message: string }>(`/api/wishlist/${itemId}`, {
      method: 'DELETE',
    }),
};

// ── Users API ───────────────────────────────────────────────

export const usersApi = {
  getProfile: () =>
    request<{ user: ApiUser }>('/api/users/profile'),

  updateProfile: (data: Partial<ApiUser>) =>
    request<{ message: string; user: ApiUser }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  listAll: () =>
    request<{ users: ApiUser[] }>('/api/users'),

  getById: (id: string) =>
    request<{ user: ApiUser; items: ApiItem[] }>(`/api/users/${id}`),

  suspend: (id: string) =>
    request<{ message: string; user: ApiUser }>(`/api/users/${id}/suspend`, {
      method: 'PUT',
    }),

  unsuspend: (id: string) =>
    request<{ message: string; user: ApiUser }>(`/api/users/${id}/unsuspend`, {
      method: 'PUT',
    }),
};

// ── Conversations API ───────────────────────────────────────

export interface ApiConversation {
  _id: string;
  participants: Array<{ _id: string; name: string; email: string; avatar: string }>;
  item?: { _id: string; title: string; images: string[] };
  type: 'user-user' | 'user-admin';
  lastMessage: {
    text: string;
    sender: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  _id: string;
  conversation: string;
  sender: { _id: string; name: string; email: string; avatar: string };
  text: string;
  readBy: string[];
  createdAt: string;
}

export const conversationsApi = {
  list: () =>
    request<{ conversations: ApiConversation[] }>('/api/conversations'),

  adminList: () =>
    request<{ conversations: ApiConversation[] }>('/api/conversations/admin'),

  create: (participantId: string, itemId?: string, type?: string) =>
    request<{ conversation: ApiConversation; existing: boolean }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId, itemId, type }),
    }),

  getMessages: (conversationId: string) =>
    request<{ messages: ApiMessage[] }>(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, text: string) =>
    request<{ message: ApiMessage }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

// ── Transactions API ────────────────────────────────────────

export interface ApiTransaction {
  _id: string;
  item: { _id: string; title: string; images: string[]; price: number };
  buyer: { _id: string; name: string; email: string; avatar: string };
  seller: { _id: string; name: string; email: string; avatar: string };
  type: 'buy' | 'swap';
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  swapItem?: { _id: string; title: string; images: string[] };
  points: number;
  createdAt: string;
}

export const transactionsApi = {
  create: (itemId: string, type: 'buy' | 'swap', swapItemId?: string) =>
    request<{ message: string; transaction: ApiTransaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ itemId, type, swapItemId }),
    }),

  list: () =>
    request<{ transactions: ApiTransaction[] }>('/api/transactions'),

  accept: (id: string) =>
    request<{ message: string; transaction: ApiTransaction }>(`/api/transactions/${id}/accept`, {
      method: 'PUT',
    }),

  reject: (id: string) =>
    request<{ message: string; transaction: ApiTransaction }>(`/api/transactions/${id}/reject`, {
      method: 'PUT',
    }),
};
