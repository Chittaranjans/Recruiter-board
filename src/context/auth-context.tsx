'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

// Define types
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  candidate_id?: number;
}

interface AuthContextType {
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string , role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  isRecruiter: () => boolean;
  isInterviewer: () => boolean;
  isCandidate: () => boolean;
  candidateId?: number;
  canManageInterviews: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false); // Set loading to false after checking
  }, []);

  const isAdmin = () => {
    return user?.role === 'admin';
  };
  
  const isRecruiter = () => {
    return user?.role === 'recruiter' || user?.role === 'admin';
  };

  const isInterviewer = () => {
    return user?.role === 'recruiter' || user?.role === 'admin';
  };

  const isCandidate = useCallback(() => {
    return user?.role === 'candidate';
  }, [user]);


  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      const { access_token } = response.data;
      
      if (access_token) {
        localStorage.setItem('token', access_token);
        
        // Fetch user data
        const userResponse = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        
        const userData = userResponse.data;
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Show success message
        toast.success('Login successful');
        
        // Redirect to the correct path - your dashboard is at '/'
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed');
      toast.error('Login failed: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, role: string = 'candidate') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role
      });
      
      if (role !== 'candidate') {
        toast.success('Registration successful! Your account needs admin approval before you can login.');
      } else {
        toast.success('Registration successful! Please log in.');
      }
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Failed to register');
      toast.error(err.response?.data?.detail || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/login');
    toast.info('You have been logged out');
  };
  const canManageInterviews = () => {
    return isRecruiter() || isInterviewer() || isAdmin();
  };
  return (
    <AuthContext.Provider value={{ 
      user, 
      error, 
      loading, 
      login, 
      register, 
      logout,
      isAuthenticated,
      isAdmin,
      isRecruiter,
      isInterviewer,
      isCandidate,
      candidateId: user?.candidate_id,
      canManageInterviews,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};