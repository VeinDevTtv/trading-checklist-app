import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole, hasPermission, canAccessModule } from '@/utils/userRoles';
import { YouTubeAuthManager } from '@/utils/youtubeAuth';

interface MentorshipState {
  // Authentication state
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // UI state
  currentModule: string | null;
  showAccessDenied: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentModule: (moduleId: string | null) => void;
  setShowAccessDenied: (show: boolean) => void;
  
  // Auth actions
  signIn: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  checkAccess: (moduleId?: string) => boolean;
  hasPermissionFor: (permission: string) => boolean;
  
  // Mock actions for testing
  mockUpgradeRole: (role: UserRole) => void;
  mockSetSubscription: (status: 'active' | 'inactive' | 'trial') => void;
}

export const useMentorshipStore = create<MentorshipState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      currentModule: null,
      showAccessDenied: false,

      // Basic setters
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setCurrentModule: (currentModule) => set({ currentModule }),
      
      setShowAccessDenied: (showAccessDenied) => set({ showAccessDenied }),

      // Authentication actions
      signIn: async () => {
        set({ isLoading: true });
        try {
          const authManager = YouTubeAuthManager.getInstance();
          const user = await authManager.signIn();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            showAccessDenied: false 
          });
          return user;
        } catch (error) {
          console.error('Sign in failed:', error);
          set({ isLoading: false });
          return null;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          const authManager = YouTubeAuthManager.getInstance();
          await authManager.signOut();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            currentModule: null,
            showAccessDenied: false
          });
        } catch (error) {
          console.error('Sign out failed:', error);
          set({ isLoading: false });
        }
      },

      // Access control
      checkAccess: (moduleId) => {
        const { user } = get();
        if (!user) return false;
        
        // Check general mentorship access
        if (!hasPermission(user.role, 'canAccessMentorship')) return false;
        
        // Check subscription status
        if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trial') {
          return false;
        }
        
        // Check module-specific access if moduleId provided
        if (moduleId && !canAccessModule(user.role, moduleId)) {
          return false;
        }
        
        return true;
      },

      hasPermissionFor: (permission) => {
        const { user } = get();
        if (!user) return false;
        return hasPermission(user.role, permission as any);
      },

      // Mock actions for testing
      mockUpgradeRole: (role) => {
        const { user } = get();
        if (user) {
          const updatedUser = {
            ...user,
            role,
            subscriptionStatus: role === 'viewer' ? 'inactive' as const : 'active' as const
          };
          set({ user: updatedUser });
          
          // Update auth manager as well
          const authManager = YouTubeAuthManager.getInstance();
          authManager.mockUpgradeUser(role);
        }
      },

      mockSetSubscription: (status) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, subscriptionStatus: status };
          set({ user: updatedUser });
          
          // Update auth manager as well
          const authManager = YouTubeAuthManager.getInstance();
          authManager.mockSetSubscriptionStatus(status);
        }
      },
    }),
    {
      name: 'mentorship-store',
      partialize: (state) => ({
        user: state.user,
        currentModule: state.currentModule,
      }),
    }
  )
);

// Initialize store with existing auth on load
export const initializeMentorshipStore = () => {
  const authManager = YouTubeAuthManager.getInstance();
  const existingUser = authManager.loadAuthFromStorage();
  
  if (existingUser) {
    useMentorshipStore.getState().setUser(existingUser);
  }
  
  // Listen for auth changes
  authManager.onAuthChange((user) => {
    useMentorshipStore.getState().setUser(user);
  });
}; 