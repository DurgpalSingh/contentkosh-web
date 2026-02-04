import { UsersService, AuthService } from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse, Business, User } from '@/lib/api';
import { OpenAPI } from '@/lib/api';

// Configure the API base URL
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await AuthService.postApiAuthLogin(credentials);
      if (response.data?.refreshToken) {
        authApi.setRefreshToken(response.data.refreshToken);
      }
      return {
        user: response.data?.user as User,
        token: response.data?.accessToken,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.body?.message || 'Login failed');
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration with data:', data);
      const response = await AuthService.postApiAuthSignup(data);
      console.log('Registration response received:', response);
      if (response.data?.refreshToken) {
        authApi.setRefreshToken(response.data.refreshToken);
      }
      return {
        user: response.data?.user as User,
        token: response.data?.accessToken,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.body?.message || 'Registration failed');
    }
  },

  getProfile: async (): Promise<User | undefined> => {
    try {
      const response = await UsersService.getApiUsersProfile();
      // @ts-ignore - response type definition mismatch in generated code
      return response.data as User;
    } catch (error: any) {
      console.error('getProfile error:', error);
      throw error;
    }
  },

  getBusiness: async (): Promise<Business | null> => {
    console.warn('getBusiness implementation missing in new API client');
    return null;
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

  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  },

  getRefreshToken: (): string | undefined => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('refreshToken');
      return token || undefined;
    }
    return undefined;
  },

  clearTokens: () => {
    OpenAPI.TOKEN = undefined;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = authApi.getRefreshToken();
    try {
      if (refreshToken) {
        await AuthService.postApiAuthLogout({ refreshToken });
      }
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      authApi.clearTokens();
    }
  },
};
