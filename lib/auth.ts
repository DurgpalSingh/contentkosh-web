import { UsersService, AuthService, BusinessService } from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse, Business, User } from '@/lib/api';
import { OpenAPI } from '@/lib/api';
import { EMAIL_VERIFICATION_MESSAGES } from '@/lib/messages';

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

/**
 * Auth failure that keeps the backend `apiCode` (and the email it refers to, when sent) so the UI
 * can offer the right next step - e.g. "resend verification email" - while the message itself is
 * still passed through from the backend.
 */
export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly apiCode?: string,
    public readonly email?: string,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAuthApiError(error: any, fallbackMessage: string): AuthApiError {
  return new AuthApiError(error.body?.message || fallbackMessage, error.body?.apiCode, error.body?.email);
}

export interface RegisterResult {
  user?: User;
  /** False when the verification mail could not be sent - offer a resend. */
  emailSent: boolean;
}

export interface VerifyEmailResult {
  alreadyVerified: boolean;
  /** True when the backend logged the user in (new institute owner, first use of the link). */
  autoLogin: boolean;
  slug: string | null;
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
      throw toAuthApiError(error, 'Login failed');
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResult> => {
    try {
      const response = await AuthService.postApiAuthSignup(data);
      return {
        user: getUserFromAuthResponse(response),
        emailSent: response.data?.emailSent ?? false,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration error:', error);
      throw toAuthApiError(error, EMAIL_VERIFICATION_MESSAGES.SIGNUP_FAILED);
    }
  },

  verifyEmail: async (token: string): Promise<VerifyEmailResult> => {
    try {
      const response = await AuthService.postApiAuthVerifyEmail({ token });
      return {
        alreadyVerified: Boolean(response.data?.alreadyVerified),
        autoLogin: Boolean(response.data?.autoLogin),
        slug: response.data?.slug ?? null,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw toAuthApiError(error, EMAIL_VERIFICATION_MESSAGES.VERIFY_FAILED_FALLBACK);
    }
  },

  resendVerification: async (email: string): Promise<void> => {
    try {
      await AuthService.postApiAuthResendVerification({ email });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw toAuthApiError(error, EMAIL_VERIFICATION_MESSAGES.RESEND_FAILED);
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
