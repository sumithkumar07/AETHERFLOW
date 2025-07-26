/**
 * 🔐 AETHERFLOW Social Authentication System
 * 
 * Comprehensive social authentication with Google, GitHub, and more
 * Integrates with existing auth system without adding new pages
 */

import logger from './logger';

class SocialAuthManager {
  constructor() {
    this.providers = {
      google: {
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        redirectUri: `${window.location.origin}/auth`,
        scope: 'openid email profile'
      },
      github: {
        clientId: process.env.REACT_APP_GITHUB_CLIENT_ID,
        redirectUri: `${window.location.origin}/auth`,
        scope: 'user:email read:user'
      },
      microsoft: {
        clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
        redirectUri: `${window.location.origin}/auth`,
        scope: 'openid email profile'
      }
    };
    
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize Google OAuth
    this.initGoogleAuth();
    
    // Initialize GitHub OAuth
    this.initGitHubAuth();
    
    // Initialize Microsoft OAuth
    this.initMicrosoftAuth();
    
    logger.info('SocialAuth', 'Social authentication providers initialized');
  }

  initGoogleAuth() {
    if (!this.providers.google.clientId) {
      logger.warn('SocialAuth', 'Google Client ID not configured');
      return;
    }

    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: this.providers.google.clientId,
          callback: this.handleGoogleCallback.bind(this),
          auto_select: false,
          cancel_on_tap_outside: false
        });
        logger.debug('SocialAuth', 'Google OAuth initialized');
      }
    };
    document.head.appendChild(script);
  }

  initGitHubAuth() {
    if (!this.providers.github.clientId) {
      logger.warn('SocialAuth', 'GitHub Client ID not configured');
      return;
    }
    logger.debug('SocialAuth', 'GitHub OAuth configured');
  }

  initMicrosoftAuth() {
    if (!this.providers.microsoft.clientId) {
      logger.warn('SocialAuth', 'Microsoft Client ID not configured');
      return;
    }
    logger.debug('SocialAuth', 'Microsoft OAuth configured');
  }

  // Google OAuth Methods
  async signInWithGoogle() {
    try {
      logger.user('SocialAuth', 'Google sign-in initiated');
      
      if (!window.google) {
        throw new Error('Google OAuth not loaded');
      }

      return new Promise((resolve, reject) => {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup
            this.googlePopupSignIn().then(resolve).catch(reject);
          }
        });
      });
    } catch (error) {
      logger.error('SocialAuth', 'Google sign-in failed', error);
      throw error;
    }
  }

  async googlePopupSignIn() {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google OAuth not loaded'));
        return;
      }

      window.google.accounts.oauth2.initTokenClient({
        client_id: this.providers.google.clientId,
        scope: this.providers.google.scope,
        callback: (tokenResponse) => {
          this.handleGoogleTokenResponse(tokenResponse).then(resolve).catch(reject);
        }
      }).requestAccessToken();
    });
  }

  async handleGoogleCallback(credentialResponse) {
    try {
      const credential = credentialResponse.credential;
      const userInfo = this.decodeJWT(credential);
      
      const authResult = await this.processUserInfo('google', userInfo);
      logger.user('SocialAuth', 'Google authentication successful', { email: userInfo.email });
      
      return authResult;
    } catch (error) {
      logger.error('SocialAuth', 'Google callback failed', error);
      throw error;
    }
  }

  async handleGoogleTokenResponse(tokenResponse) {
    try {
      if (tokenResponse.error) {
        throw new Error(tokenResponse.error);
      }

      // Fetch user info using access token
      const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`);
      const userInfo = await userInfoResponse.json();
      
      const authResult = await this.processUserInfo('google', userInfo);
      logger.user('SocialAuth', 'Google token authentication successful', { email: userInfo.email });
      
      return authResult;
    } catch (error) {
      logger.error('SocialAuth', 'Google token response failed', error);
      throw error;
    }
  }

  // GitHub OAuth Methods
  async signInWithGitHub() {
    try {
      logger.user('SocialAuth', 'GitHub sign-in initiated');
      
      const { clientId, redirectUri, scope } = this.providers.github;
      const state = this.generateState();
      
      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
      
      // Store state for verification
      sessionStorage.setItem('github_oauth_state', state);
      
      // Open popup window
      const popup = window.open(authUrl, 'github-auth', 'width=600,height=700');
      
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup.close();
            resolve(event.data.user);
          } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            reject(new Error(event.data.error));
          }
        });
      });
    } catch (error) {
      logger.error('SocialAuth', 'GitHub sign-in failed', error);
      throw error;
    }
  }

  // Microsoft OAuth Methods
  async signInWithMicrosoft() {
    try {
      logger.user('SocialAuth', 'Microsoft sign-in initiated');
      
      const { clientId, redirectUri, scope } = this.providers.microsoft;
      const state = this.generateState();
      
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_mode=query&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`;
      
      // Store state for verification
      sessionStorage.setItem('microsoft_oauth_state', state);
      
      // Open popup window
      const popup = window.open(authUrl, 'microsoft-auth', 'width=600,height=700');
      
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'MICROSOFT_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup.close();
            resolve(event.data.user);
          } else if (event.data.type === 'MICROSOFT_AUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            reject(new Error(event.data.error));
          }
        });
      });
    } catch (error) {
      logger.error('SocialAuth', 'Microsoft sign-in failed', error);
      throw error;
    }
  }

  // Process OAuth callback (for GitHub and Microsoft)
  async processOAuthCallback(provider, code, state) {
    try {
      // Verify state
      const storedState = sessionStorage.getItem(`${provider}_oauth_state`);
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/auth/oauth/${provider}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });

      if (!tokenResponse.ok) {
        throw new Error('Token exchange failed');
      }

      const tokenData = await tokenResponse.json();
      
      // Fetch user info
      const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/auth/oauth/${provider}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('User info fetch failed');
      }

      const userInfo = await userResponse.json();
      
      // Clean up state
      sessionStorage.removeItem(`${provider}_oauth_state`);
      
      return await this.processUserInfo(provider, userInfo);
    } catch (error) {
      logger.error('SocialAuth', `${provider} OAuth callback failed`, error);
      throw error;
    }
  }

  // Process user information from any provider
  async processUserInfo(provider, userInfo) {
    try {
      const user = this.normalizeUserInfo(provider, userInfo);
      
      // Send to backend for authentication/registration
      const authResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/auth/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          user,
          timestamp: new Date().toISOString()
        })
      });

      if (!authResponse.ok) {
        throw new Error('Social authentication failed');
      }

      const authResult = await authResponse.json();
      
      // Store authentication result
      localStorage.setItem('aetherflow_auth_token', authResult.token);
      localStorage.setItem('aetherflow_user', JSON.stringify(authResult.user));
      
      logger.user('SocialAuth', `${provider} authentication completed`, { 
        email: user.email,
        provider 
      });
      
      return authResult;
    } catch (error) {
      logger.error('SocialAuth', 'User info processing failed', error);
      throw error;
    }
  }

  // Normalize user information from different providers
  normalizeUserInfo(provider, userInfo) {
    const baseUser = {
      provider,
      providerId: userInfo.id || userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture || userInfo.avatar_url,
      verified: userInfo.email_verified !== false
    };

    switch (provider) {
      case 'google':
        return {
          ...baseUser,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          locale: userInfo.locale
        };
      
      case 'github':
        return {
          ...baseUser,
          username: userInfo.login,
          company: userInfo.company,
          location: userInfo.location,
          bio: userInfo.bio,
          publicRepos: userInfo.public_repos
        };
      
      case 'microsoft':
        return {
          ...baseUser,
          firstName: userInfo.given_name,
          lastName: userInfo.surname,
          jobTitle: userInfo.jobTitle,
          preferredLanguage: userInfo.preferredLanguage
        };
      
      default:
        return baseUser;
    }
  }

  // Utility methods
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      logger.error('SocialAuth', 'JWT decode failed', error);
      throw new Error('Invalid token format');
    }
  }

  // Check if social auth is available
  isProviderAvailable(provider) {
    return this.providers[provider] && this.providers[provider].clientId;
  }

  // Get available providers
  getAvailableProviders() {
    return Object.keys(this.providers).filter(provider => 
      this.isProviderAvailable(provider)
    );
  }

  // Sign out from social providers
  async signOut() {
    try {
      // Clear local storage
      localStorage.removeItem('aetherflow_auth_token');
      localStorage.removeItem('aetherflow_user');
      
      // Sign out from Google
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      logger.user('SocialAuth', 'Social sign-out completed');
    } catch (error) {
      logger.error('SocialAuth', 'Sign-out failed', error);
    }
  }
}

// Create singleton instance
const socialAuth = new SocialAuthManager();

export default socialAuth;

// Helper functions for components
export const socialAuthHelpers = {
  signInWithGoogle: () => socialAuth.signInWithGoogle(),
  signInWithGitHub: () => socialAuth.signInWithGitHub(),
  signInWithMicrosoft: () => socialAuth.signInWithMicrosoft(),
  isProviderAvailable: (provider) => socialAuth.isProviderAvailable(provider),
  getAvailableProviders: () => socialAuth.getAvailableProviders(),
  signOut: () => socialAuth.signOut()
};