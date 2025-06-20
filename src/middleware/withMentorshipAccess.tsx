'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, hasPermission } from '@/utils/userRoles';
import { YouTubeAuthManager } from '@/utils/youtubeAuth';

interface WithMentorshipAccessProps {
  requiredRole?: 'viewer' | 'mentee' | 'admin';
  requireSubscription?: boolean;
  moduleId?: string;
  fallbackPath?: string;
}

export function withMentorshipAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithMentorshipAccessProps = {}
) {
  const {
    requiredRole = 'mentee',
    requireSubscription = true,
    moduleId,
    fallbackPath = '/mentorship-access-denied'
  } = options;

  return function MentorshipProtectedComponent(props: P) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAccess = async () => {
        const authManager = YouTubeAuthManager.getInstance();
        
        try {
          // Initialize auth manager
          await authManager.initialize();
          
          // Check for existing user
          let currentUser = authManager.getCurrentUser();
          if (!currentUser) {
            currentUser = authManager.loadAuthFromStorage();
          }
          
          setUser(currentUser);
          
          if (!currentUser) {
            setHasAccess(false);
            setIsLoading(false);
            return;
          }

          // Check role requirements
          const roleRequirements = getRoleRequirements(requiredRole);
          const userRoleLevel = getRoleLevel(currentUser.role);
          
          if (userRoleLevel < roleRequirements) {
            setHasAccess(false);
            setIsLoading(false);
            return;
          }

          // Check subscription if required
          if (requireSubscription) {
            const hasValidSubscription = currentUser.subscriptionStatus === 'active' || 
                                       currentUser.subscriptionStatus === 'trial';
            if (!hasValidSubscription) {
              setHasAccess(false);
              setIsLoading(false);
              return;
            }
          }

          // Check mentorship permission
          if (!hasPermission(currentUser.role, 'canAccessMentorship')) {
            setHasAccess(false);
            setIsLoading(false);
            return;
          }

          // Check module-specific access if provided
          if (moduleId) {
            const moduleAccess = checkModuleAccess(currentUser.role, moduleId);
            if (!moduleAccess) {
              setHasAccess(false);
              setIsLoading(false);
              return;
            }
          }

          setHasAccess(true);
        } catch (error) {
          console.error('Access check failed:', error);
          setHasAccess(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkAccess();

      // Listen for auth changes
      const authManager = YouTubeAuthManager.getInstance();
      const unsubscribe = authManager.onAuthChange((newUser) => {
        setUser(newUser);
        if (!newUser) {
          setHasAccess(false);
        }
      });

      return unsubscribe;
    }, [requiredRole, requireSubscription, moduleId]);

    // Redirect if no access
    useEffect(() => {
      if (!isLoading && !hasAccess) {
        router.push(fallbackPath);
      }
    }, [isLoading, hasAccess, router, fallbackPath]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!hasAccess) {
      return null; // Will redirect
    }

    return <WrappedComponent {...props} />;
  };
}

// Helper functions
function getRoleLevel(role: 'viewer' | 'mentee' | 'admin'): number {
  switch (role) {
    case 'viewer': return 1;
    case 'mentee': return 2;
    case 'admin': return 3;
    default: return 0;
  }
}

function getRoleRequirements(requiredRole: 'viewer' | 'mentee' | 'admin'): number {
  return getRoleLevel(requiredRole);
}

function checkModuleAccess(userRole: 'viewer' | 'mentee' | 'admin', moduleId: string): boolean {
  const modulePermissions = {
    'risk': ['mentee', 'admin'],
    'psychology': ['mentee', 'admin'],
    'signals': ['mentee', 'admin'],
    'smartmoney': ['mentee', 'admin'],
    'walkthroughs': ['mentee', 'admin'],
  };

  return modulePermissions[moduleId as keyof typeof modulePermissions]?.includes(userRole) || false;
}

// Hook version for use in functional components
export function useMentorshipAccess(options: WithMentorshipAccessProps = {}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const {
    requiredRole = 'mentee',
    requireSubscription = true,
    moduleId
  } = options;

  useEffect(() => {
    const checkAccess = async () => {
      const authManager = YouTubeAuthManager.getInstance();
      
      try {
        await authManager.initialize();
        
        let currentUser = authManager.getCurrentUser();
        if (!currentUser) {
          currentUser = authManager.loadAuthFromStorage();
        }
        
        setUser(currentUser);
        
        if (!currentUser) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Same access checks as HOC
        const roleRequirements = getRoleRequirements(requiredRole);
        const userRoleLevel = getRoleLevel(currentUser.role);
        
        if (userRoleLevel < roleRequirements) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        if (requireSubscription) {
          const hasValidSubscription = currentUser.subscriptionStatus === 'active' || 
                                     currentUser.subscriptionStatus === 'trial';
          if (!hasValidSubscription) {
            setHasAccess(false);
            setIsLoading(false);
            return;
          }
        }

        if (!hasPermission(currentUser.role, 'canAccessMentorship')) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        if (moduleId && !checkModuleAccess(currentUser.role, moduleId)) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();

    const authManager = YouTubeAuthManager.getInstance();
    const unsubscribe = authManager.onAuthChange((newUser) => {
      setUser(newUser);
      if (!newUser) {
        setHasAccess(false);
      }
    });

    return unsubscribe;
  }, [requiredRole, requireSubscription, moduleId]);

  return { user, isLoading, hasAccess };
} 