import { UsersService, AuthService, BusinessService } from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse, Business, User } from '@/lib/api';
import { OpenAPI } from '@/lib/api';

// Configure the API base URL
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.CREDENTIALS = 'include';

function getUserFromAuthResponse(response: unknown): User | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return undefined;

  if ('user' in data && (data as { user?: unknown }).user && typeof (data as { user?: unknown }).user === 'object') {
    return (data as { user?: User }).user;
  }

  return data as User;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await AuthService.postApiAuthLogin(credentials);
      const user = getUserFromAuthResponse(response);
      return {
        user,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const user = getUserFromAuthResponse(response);
      return {
        user,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.body?.message || 'Registration failed');
    }
  },

  getProfile: async (): Promise<User | undefined> => {
    try {
      const response = await UsersService.getApiUsersProfile();
      // @ts-expect-error - response type definition mismatch in generated code
      return response.data as User;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('getProfile error:', error);
      throw error;
    }
  },

  getBusiness: async (): Promise<Business | null> => {
    try {
      // Fetch profile to get businessId
      const user = await authApi.getProfile();
      if (user?.businessId) {
        const response = await BusinessService.getApiBusiness1(user.businessId);
        return response.data || null;
      }
      return null;
    } catch (error) {
      console.warn('getBusiness error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AuthService.postApiAuthLogout();
    } catch (e) {
      console.error('Error during logout:', e);
    }
  },
};
