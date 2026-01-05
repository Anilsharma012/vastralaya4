const API_BASE = '/api';

// Get stored token from localStorage
const getToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

// Helper to build headers with auth token
const getHeaders = (customHeaders: Record<string, string> = {}) => {
  const headers = { ...customHeaders };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? getHeaders() : getHeaders({ 'Content-Type': 'application/json' });

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },

  // Store auth token in localStorage
  setToken(token: string) {
    try {
      localStorage.setItem('authToken', token);
    } catch {
      console.error('Failed to store auth token');
    }
  },

  // Clear auth token from localStorage
  clearToken() {
    try {
      localStorage.removeItem('authToken');
    } catch {
      console.error('Failed to clear auth token');
    }
  },
};

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Subcategory {
  _id: string;
  categoryId: string | Category;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetLink?: string;
  buttonText?: string;
  placement: 'hero' | 'promo' | 'sidebar';
  isActive: boolean;
  priority: number;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: string | Category;
  subcategoryId?: string | Subcategory;
  images: string[];
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  variants: Array<{
    _id: string;
    size?: string;
    color?: string;
    sku: string;
    price: number;
    comparePrice?: number;
    stock: number;
    images?: string[];
  }>;
  attributes: Record<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  categories: number;
  subcategories: number;
  banners: number;
  users: number;
}
