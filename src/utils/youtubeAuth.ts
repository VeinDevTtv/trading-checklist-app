import { UserProfile, getUserRoleFromEmail } from './userRoles';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export interface GoogleAuthResponse {
  access_token: string;
  email: string;
  name: string;
  picture: string;
  id: string;
}

export class YouTubeAuthManager {
  private static instance: YouTubeAuthManager;
  private isInitialized = false;
  private currentUser: UserProfile | null = null;
  private authListeners: Array<(user: UserProfile | null) => void> = [];

  private constructor() {}

  public static getInstance(): YouTubeAuthManager {
    if (!YouTubeAuthManager.instance) {
      YouTubeAuthManager.instance = new YouTubeAuthManager();
    }
    return YouTubeAuthManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Google API script
      await this.loadGoogleAPI();
      
      // Initialize Google API
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: 'email profile https://www.googleapis.com/auth/youtube.readonly'
          }).then(() => {
            this.isInitialized = true;
            this.checkExistingAuth();
            resolve();
          }).catch(reject);
        });
      });
    } catch (error) {
      console.error('Failed to initialize YouTube auth:', error);
      throw error;
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  private checkExistingAuth(): void {
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (authInstance.isSignedIn.get()) {
      const googleUser = authInstance.currentUser.get();
      this.setCurrentUser(googleUser);
    }
  }

  public async signIn(): Promise<UserProfile> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    const googleUser = await authInstance.signIn();
    
    const userProfile = this.setCurrentUser(googleUser);
    this.saveAuthToStorage(userProfile);
    
    return userProfile;
  }

  public async signOut(): Promise<void> {
    if (!this.isInitialized) return;

    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    
    this.currentUser = null;
    this.clearAuthFromStorage();
    this.notifyAuthListeners(null);
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public hasValidYouTubeAccess(): boolean {
    if (!this.isAuthenticated()) return false;
    
    const authInstance = window.gapi?.auth2?.getAuthInstance();
    if (!authInstance) return false;
    
    const googleUser = authInstance.currentUser.get();
    return googleUser.hasGrantedScopes('https://www.googleapis.com/auth/youtube.readonly');
  }

  private setCurrentUser(googleUser: any): UserProfile {
    const profile = googleUser.getBasicProfile();
    const email = profile.getEmail();
    
    const userProfile: UserProfile = {
      id: profile.getId(),
      email: email,
      name: profile.getName(),
      picture: profile.getImageUrl(),
      role: getUserRoleFromEmail(email),
      subscriptionStatus: this.getSubscriptionStatus(email),
    };

    this.currentUser = userProfile;
    this.notifyAuthListeners(userProfile);
    
    return userProfile;
  }

  private getSubscriptionStatus(email: string): 'active' | 'inactive' | 'trial' {
    // Mock subscription status - in production, check against your payment system
    if (email.includes('mentee@') || email.includes('admin@') || email.includes('trading@')) {
      return 'active';
    }
    return 'inactive';
  }

  private saveAuthToStorage(user: UserProfile): void {
    try {
      localStorage.setItem('mentorship_user', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save auth to storage:', error);
    }
  }

  private clearAuthFromStorage(): void {
    try {
      localStorage.removeItem('mentorship_user');
    } catch (error) {
      console.warn('Failed to clear auth from storage:', error);
    }
  }

  public loadAuthFromStorage(): UserProfile | null {
    try {
      const stored = localStorage.getItem('mentorship_user');
      if (stored) {
        const user = JSON.parse(stored) as UserProfile;
        this.currentUser = user;
        this.notifyAuthListeners(user);
        return user;
      }
    } catch (error) {
      console.warn('Failed to load auth from storage:', error);
    }
    return null;
  }

  public onAuthChange(listener: (user: UserProfile | null) => void): () => void {
    this.authListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(listener);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  private notifyAuthListeners(user: UserProfile | null): void {
    this.authListeners.forEach(listener => listener(user));
  }

  // Mock methods for testing role upgrades
  public mockUpgradeUser(newRole: 'viewer' | 'mentee' | 'admin'): void {
    if (this.currentUser) {
      this.currentUser.role = newRole;
      this.currentUser.subscriptionStatus = newRole === 'viewer' ? 'inactive' : 'active';
      this.saveAuthToStorage(this.currentUser);
      this.notifyAuthListeners(this.currentUser);
    }
  }

  public mockSetSubscriptionStatus(status: 'active' | 'inactive' | 'trial'): void {
    if (this.currentUser) {
      this.currentUser.subscriptionStatus = status;
      this.saveAuthToStorage(this.currentUser);
      this.notifyAuthListeners(this.currentUser);
    }
  }
} 