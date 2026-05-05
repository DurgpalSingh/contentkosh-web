import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Business } from '@/lib/api';
import { authApi } from '@/lib/auth';
import { AuthService } from '@/lib/api';
import { permissionService } from '@/services/PermissionService';

let initializeAuthPromise: Promise<void> | null = null;

interface AuthState {
  user: User | null;
  business: Business | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, business: Business | null) => void;
  setProfile: (profile: User) => void;

  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      business: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      setProfile: (profile: User) => {
        console.log('Auth store setProfile called with:', profile);

        let businessData = profile.business || null;

        // Fallback: If business object is missing but we have businessId, create a partial business object
        // This ensures the ID is available for API calls even if full business details aren't loaded yet
        if (!businessData && profile.businessId) {
          console.warn('Business object missing in user profile, using businessId fallback');
          businessData = { id: profile.businessId };
        }

        set({
          user: profile,
          business: businessData,
        });
        console.log('Auth store updated with business:', businessData);
      },
      login: (user: User, business: Business | null) => {
        console.log('Auth store login called with:', { user, business });
        set({
          user,
          business,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });

        // Trigger permission fetch in background
        get().fetchPermissions();

        console.log('Auth state updated');
      },
      logout: async () => {
        await authApi.logout();
        set({
          user: null,
          business: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      },
      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),
      fetchPermissions: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          console.log('Fetching user permissions...');
          const permissions = await permissionService.getMyPermissions();
          console.log('Permissions fetched:', permissions);
          set({ permissions });
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
          // Don't modify auth state on permission fetch failure, just log it
          // Or strictly, set permissions to empty array
          set({ permissions: [] });
        }
      },
      initializeAuth: async () => {
        if (initializeAuthPromise) {
          return initializeAuthPromise;
        }

        set({ isLoading: true });

        const hydrateSession = async (): Promise<void> => {
          const userProfile = await authApi.getProfile();
          if (!userProfile) throw new Error('User profile missing');
          const businessInfo = await authApi.getBusiness();

          set({
            isAuthenticated: true,
            user: userProfile,
            business: businessInfo,
            isLoading: false,
            isInitialized: true
          });

          get().fetchPermissions();
          console.log('Successfully initialized auth from cookie session');
        };

        const setUnauthenticatedState = () => {
          console.log('No active cookie session found, setting not authenticated');
          set({
            isLoading: false,
            isInitialized: true,
            isAuthenticated: false,
            user: null,
            business: null,
            permissions: []
          });
        };

        initializeAuthPromise = (async () => {
          console.log('Attempting to initialize auth from cookie session');
          const hydratedWithoutRefresh = await hydrateSession()
            .then(() => true)
            .catch(() => false);

          if (hydratedWithoutRefresh) {
            return;
          }

          console.log('Access session missing/expired. Attempting refresh.');
          const refreshed = await AuthService.postApiAuthRefresh({} as { refreshToken: string })
            .then(() => true)
            .catch(() => false);

          if (!refreshed) {
            setUnauthenticatedState();
            return;
          }

          await hydrateSession().catch(() => {
            setUnauthenticatedState();
          });
        })();

        try {
          await initializeAuthPromise;
        } finally {
          initializeAuthPromise = null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        // We can persist permissions too
        permissions: state.permissions,
      }),
    }
  )
);
