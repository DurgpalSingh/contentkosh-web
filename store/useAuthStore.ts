import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Business } from '@/lib/api';
import { authApi } from '@/lib/auth';
import { permissionService } from '@/services/permission.service';

interface AuthState {
  user: User | null;
  business: Business | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, business: Business | null, token: string) => void;
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
      token: null,
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
      login: (user: User, business: Business | null, token: string) => {
        console.log('Auth store login called with:', { user, business, token });
        authApi.setToken(token);
        set({
          user,
          business,
          token,
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
          token: null,
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
        const token = authApi.getToken();

        if (token) {
          // Set token in OpenAPI for future requests
          authApi.setToken(token);

          // Get the current state from persist
          const currentState = get();
          console.log('Current state from persist:', currentState);

          // If we already have user data from persist, use it but refresh permissions AND profile
          if (currentState.user && currentState.isAuthenticated) {
            console.log('Using persisted user data');
            set({
              token,
              isAuthenticated: true,
              user: currentState.user,
              business: currentState.business,
              isLoading: false,
              isInitialized: true
            });

            // Refresh permissions
            get().fetchPermissions();

            // Refresh profile to ensure we have latest role/data
            try {
              const userProfile = await authApi.getProfile();
              if (userProfile) {
                // Update business info if available from profile
                const businessInfo = userProfile.business || currentState.business;
                set({ user: userProfile, business: businessInfo });
              }
            } catch (error) {
              console.warn('Failed to refresh profile on init:', error);
            }
            return;
          }

          // Try to fetch user profile from API
          try {
            console.log('Attempting to fetch user profile from API');
            const userProfile = await authApi.getProfile();
            const businessInfo = await authApi.getBusiness();

            set({
              token,
              isAuthenticated: true,
              user: userProfile,
              business: businessInfo,
              isLoading: false,
              isInitialized: true
            });

            // Fetch permissions after profile load
            get().fetchPermissions();

            console.log('Successfully fetched user profile and business info from API');
          } catch (error) {
            set({
              isLoading: false,
              isInitialized: true,
              isAuthenticated: false,
              user: null,
              business: null,
              token: null,
              permissions: []
            });
            // Force logout to clean up anything stale
            get().logout();
          }
        } else {
          console.log('No token found, setting not authenticated');
          set({
            isLoading: false,
            isInitialized: true,
            isAuthenticated: false,
            user: null,
            business: null,
            token: null,
            permissions: []
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        // We can persist permissions too
        permissions: state.permissions,
      }),
    }
  )
);
