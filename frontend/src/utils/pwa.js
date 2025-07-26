/**
 * 🚀 AETHERFLOW Progressive Web App (PWA) Utilities
 * 
 * Service worker registration, PWA installation, and offline functionality
 */

import logger from './logger';

class PWAManager {
  constructor() {
    this.isServiceWorkerSupported = 'serviceWorker' in navigator;
    this.isInstallable = false;
    this.deferredPrompt = null;
    this.serviceWorkerRegistration = null;
    
    this.init();
  }

  async init() {
    try {
      // Register service worker
      if (this.isServiceWorkerSupported) {
        await this.registerServiceWorker();
      }
      
      // Setup PWA installation
      this.setupInstallPrompt();
      
      // Setup push notifications
      this.setupPushNotifications();
      
      // Check for updates
      this.checkForUpdates();
      
      logger.info('PWA', 'PWA Manager initialized successfully');
    } catch (error) {
      logger.error('PWA', 'PWA Manager initialization failed', error);
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      this.serviceWorkerRegistration = registration;
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                this.showUpdateNotification();
              } else {
                // Content is cached for first time
                logger.info('PWA', 'App is ready for offline use');
              }
            }
          });
        }
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          this.showUpdateNotification();
        }
      });
      
      logger.info('PWA', 'Service worker registered successfully');
    } catch (error) {
      logger.error('PWA', 'Service worker registration failed', error);
    }
  }

  setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent the default mini-infobar
      event.preventDefault();
      
      // Store the event for later use
      this.deferredPrompt = event;
      this.isInstallable = true;
      
      // Show custom install button
      this.showInstallButton();
      
      logger.info('PWA', 'Install prompt available');
    });
    
    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstallable = false;
      this.hideInstallButton();
      
      logger.user('PWA', 'App installed successfully');
    });
  }

  async installApp() {
    if (!this.deferredPrompt) {
      logger.warn('PWA', 'Install prompt not available');
      return false;
    }
    
    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const result = await this.deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        logger.user('PWA', 'User accepted install prompt');
        return true;
      } else {
        logger.user('PWA', 'User dismissed install prompt');
        return false;
      }
    } catch (error) {
      logger.error('PWA', 'Install prompt failed', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById('pwa-install-button')) {
      const installButton = document.createElement('button');
      installButton.id = 'pwa-install-button';
      installButton.innerHTML = '📱 Install App';
      installButton.className = 'pwa-install-button';
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
      `;
      
      installButton.addEventListener('click', () => {
        this.installApp();
      });
      
      document.body.appendChild(installButton);
    }
  }

  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e293b;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        max-width: 300px;
        border: 1px solid #374151;
      ">
        <div style="margin-bottom: 12px;">
          <strong>🚀 Update Available</strong>
        </div>
        <div style="margin-bottom: 16px; font-size: 14px; color: #94a3b8;">
          A new version of AETHERFLOW is available. Refresh to update.
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-update-button" style="
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Update Now</button>
          <button id="pwa-dismiss-button" style="
            background: transparent;
            color: #94a3b8;
            border: 1px solid #4b5563;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Handle update button click
    document.getElementById('pwa-update-button').addEventListener('click', () => {
      this.updateApp();
    });
    
    // Handle dismiss button click
    document.getElementById('pwa-dismiss-button').addEventListener('click', () => {
      notification.remove();
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.getElementById('pwa-update-notification')) {
        notification.remove();
      }
    }, 10000);
  }

  updateApp() {
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
      // Tell the service worker to skip waiting
      this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to apply the update
      window.location.reload();
    } else {
      // Fallback: just reload the page
      window.location.reload();
    }
  }

  async setupPushNotifications() {
    if (!('Notification' in window) || !this.serviceWorkerRegistration) {
      logger.warn('PWA', 'Push notifications not supported');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        logger.info('PWA', 'Push notification permission granted');
        
        // Subscribe to push notifications
        const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
        });
        
        // Send subscription to server
        await this.sendSubscriptionToServer(subscription);
      } else {
        logger.warn('PWA', 'Push notification permission denied');
      }
    } catch (error) {
      logger.error('PWA', 'Push notification setup failed', error);
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      logger.info('PWA', 'Push subscription sent to server');
    } catch (error) {
      logger.error('PWA', 'Failed to send push subscription', error);
    }
  }

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  checkForUpdates() {
    // Check for updates every 30 minutes
    setInterval(() => {
      if (this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration.update();
      }
    }, 30 * 60 * 1000);
  }

  // Network status monitoring
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      logger.info('PWA', 'Network connection restored');
      this.showNetworkStatus('online');
    });
    
    window.addEventListener('offline', () => {
      logger.warn('PWA', 'Network connection lost');
      this.showNetworkStatus('offline');
    });
  }

  showNetworkStatus(status) {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
      statusElement.textContent = status === 'online' ? '🌐 Online' : '📡 Offline';
      statusElement.className = `network-status ${status}`;
    }
  }

  // PWA status checks
  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  isOnline() {
    return navigator.onLine;
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  // Analytics
  trackPWAEvent(event, data = {}) {
    logger.user('PWA', `PWA Event: ${event}`, data);
    
    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', event, {
        event_category: 'PWA',
        ...data
      });
    }
  }

  // Cleanup
  cleanup() {
    this.hideInstallButton();
    
    const updateNotification = document.getElementById('pwa-update-notification');
    if (updateNotification) {
      updateNotification.remove();
    }
  }
}

// Create singleton instance
const pwaManager = new PWAManager();

// Export PWA utilities
export default pwaManager;

export const pwa = {
  install: () => pwaManager.installApp(),
  update: () => pwaManager.updateApp(),
  isInstalled: () => pwaManager.isInstalled(),
  isOnline: () => pwaManager.isOnline(),
  getConnectionInfo: () => pwaManager.getConnectionInfo(),
  trackEvent: (event, data) => pwaManager.trackPWAEvent(event, data)
};