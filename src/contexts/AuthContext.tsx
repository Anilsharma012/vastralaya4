import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Admin, User } from '@/lib/api';

interface AuthContextType {
  admin: Admin | null;
  user: User | null;
  isAdminLoading: boolean;
  isUserLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  userLogin: (email: string, password: string) => Promise<void>;
  userRegister: (email: string, password: string, name: string, phone?: string, referralCode?: string) => Promise<void>;
  userLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // Restore token from localStorage if available
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        api.setToken(token);
      }
    } catch {
      // localStorage not available
    }

    checkAdminAuth();
    checkUserAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const adminData = await api.get<Admin>('/auth/admin/me');
      setAdmin(adminData);
    } catch {
      setAdmin(null);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      const userData = await api.get<User>('/auth/user/me');
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const response = await api.post<{ admin: Admin; token: string }>('/auth/admin/login', { email, password });
    setAdmin(response.admin);
    // Store token for subsequent requests
    if (response.token) {
      api.setToken(response.token);
    }
  };

  const adminLogout = async () => {
    await api.post('/auth/admin/logout');
    api.clearToken();
    setAdmin(null);
  };

  const userLogin = async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/user/login', { email, password });
    setUser(response.user);
    // Store token for subsequent requests
    if (response.token) {
      api.setToken(response.token);
    }
  };

  const userRegister = async (email: string, password: string, name: string, phone?: string, referralCode?: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/user/register', { email, password, name, phone, referralCode });
    setUser(response.user);
    if (response.token) {
      api.setToken(response.token);
    }
  };

  const userLogout = async () => {
    await api.post('/auth/user/logout');
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      admin,
      user,
      isAdminLoading,
      isUserLoading,
      adminLogin,
      adminLogout,
      userLogin,
      userRegister,
      userLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
