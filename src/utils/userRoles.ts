export type UserRole = 'viewer' | 'mentee' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionTier?: 'basic' | 'premium' | 'vip';
  accessExpiry?: Date;
}

export const ROLE_PERMISSIONS = {
  viewer: {
    canAccessMentorship: false,
    canViewModules: [],
    canComment: false,
  },
  mentee: {
    canAccessMentorship: true,
    canViewModules: ['risk', 'psychology', 'signals', 'smartmoney', 'walkthroughs'],
    canComment: true,
  },
  admin: {
    canAccessMentorship: true,
    canViewModules: ['risk', 'psychology', 'signals', 'smartmoney', 'walkthroughs'],
    canComment: true,
    canManageUsers: true,
    canUploadContent: true,
  },
} as const;

export const hasPermission = (userRole: UserRole, permission: keyof typeof ROLE_PERMISSIONS.mentee): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions?.[permission] === true;
};

export const canAccessModule = (userRole: UserRole, moduleId: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return (rolePermissions?.canViewModules as readonly string[])?.includes(moduleId) || false;
};

export const getUserRoleFromEmail = (email: string): UserRole => {
  // Mock role assignment - in production, this would come from your database
  // For demo purposes, specific emails get different roles
  if (email.includes('admin@') || email.includes('mentor@')) {
    return 'admin';
  }
  
  // For testing, allow mentee access for specific patterns
  if (email.includes('mentee@') || email.includes('student@') || email.includes('trading@')) {
    return 'mentee';
  }
  
  return 'viewer';
};

export const mockUserUpgrade = (currentRole: UserRole): UserRole => {
  // For testing role upgrades
  if (currentRole === 'viewer') return 'mentee';
  if (currentRole === 'mentee') return 'admin';
  return currentRole;
}; 