import { UsersService, BusinessUsersService } from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse, Business, UserProfile } from '@/lib/api';
import { OpenAPI } from '@/lib/api';

// Configure the API base URL
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await UsersService.postApiUsersLogin(credentials);
      return response.data!;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.body?.message || 'Login failed');
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration with data:', data);
      const response = await UsersService.postApiUsersRegister(data);
      console.log('Registration response received:', response);
      return response.data!;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.body?.message || 'Registration failed');
    }
  },

  getProfile: async (): Promise<UserProfile | undefined> => {
    try {
      const response = await UsersService.getApiUsersProfile();
      return response.data as UserProfile;
    } catch (error: any) {
      throw new Error(error.body?.message || 'Failed to fetch profile');
    }
  },

  getBusiness: async (): Promise<Business | null> => {
    try {
      const response = await BusinessUsersService.getApiUsersMyBusinesses();
      return response.data?.[0]?.business || null;
    } catch (error: any) {
      console.warn('Failed to fetch business information:', error);
      return null;
    }
  },

  setToken: (token: string) => {
    OpenAPI.TOKEN = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  getToken: (): string | undefined => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token || undefined;
    }
    return typeof OpenAPI.TOKEN === 'string' ? OpenAPI.TOKEN : undefined;
  },

  logout: async (): Promise<void> => {
    OpenAPI.TOKEN = undefined;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
};
