import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUIStore = create(
  persist(
    (set, get) => ({
      // Navigation state
      sidebarOpen: false,
      mobileMenuOpen: false,
      
      // Modal state
      modals: {
        settings: false,
        profile: false,
        projectCreate: false,
        templatePreview: false,
        integrationConfig: false,
        agentConfig: false,
        deploymentConfig: false
      },
      
      // Notification state
      notifications: [],
      notificationSettings: {
        showToasts: true,
        playSound: false,
        position: 'top-right',
        duration: 4000
      },
      
      // Layout preferences
      layout: {
        chatSidebarWidth: 300,
        projectSidebarWidth: 280,
        rightPanelWidth: 260,
        compactMode: false,
        showTimestamps: false,
        showAvatars: true
      },
      
      // Search state
      search: {
        query: '',
        filters: {},
        results: [],
        isSearching: false,
        recentSearches: []
      },
      
      // Loading states
      loading: {
        global: false,
        projects: false,
        chat: false,
        deployment: false,
        integration: false
      },
      
      // Tour and onboarding
      onboarding: {
        hasSeenWelcome: false,
        completedSteps: [],
        currentStep: 0,
        showHints: true
      },
      
      // Workspace state
      workspace: {
        activePanel: 'chat', // 'chat', 'files', 'preview', 'terminal'
        splitView: false,
        fullscreen: false,
        zoom: 100
      },

      // Actions
      toggleSidebar: () => {
        set((state) => ({
          sidebarOpen: !state.sidebarOpen
        }))
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      toggleMobileMenu: () => {
        set((state) => ({
          mobileMenuOpen: !state.mobileMenuOpen
        }))
      },

      setMobileMenuOpen: (open) => {
        set({ mobileMenuOpen: open })
      },

      // Modal management
      openModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: true
          }
        }))
      },

      closeModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: false
          }
        }))
      },

      closeAllModals: () => {
        set((state) => ({
          modals: Object.keys(state.modals).reduce((acc, key) => ({
            ...acc,
            [key]: false
          }), {})
        }))
      },

      toggleModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: !state.modals[modalName]
          }
        }))
      },

      // Notification management
      addNotification: (notification) => {
        const id = Date.now().toString()
        const newNotification = {
          id,
          timestamp: new Date().toISOString(),
          read: false,
          ...notification
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }))

        // Auto-remove after duration if specified
        if (notification.autoRemove !== false) {
          const duration = notification.duration || get().notificationSettings.duration
          setTimeout(() => {
            get().removeNotification(id)
          }, duration)
        }

        return id
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notificationSettings: {
            ...state.notificationSettings,
            ...settings
          }
        }))
      },

      // Layout management
      updateLayout: (layoutUpdates) => {
        set((state) => ({
          layout: {
            ...state.layout,
            ...layoutUpdates
          }
        }))
      },

      resetLayout: () => {
        set({
          layout: {
            chatSidebarWidth: 300,
            projectSidebarWidth: 280,
            rightPanelWidth: 260,
            compactMode: false,
            showTimestamps: false,
            showAvatars: true
          }
        })
      },

      // Search management
      setSearchQuery: (query) => {
        set((state) => ({
          search: {
            ...state.search,
            query
          }
        }))
      },

      setSearchFilters: (filters) => {
        set((state) => ({
          search: {
            ...state.search,
            filters: {
              ...state.search.filters,
              ...filters
            }
          }
        }))
      },

      setSearchResults: (results) => {
        set((state) => ({
          search: {
            ...state.search,
            results,
            isSearching: false
          }
        }))
      },

      setSearching: (isSearching) => {
        set((state) => ({
          search: {
            ...state.search,
            isSearching
          }
        }))
      },

      addRecentSearch: (query) => {
        if (!query.trim()) return

        set((state) => {
          const recentSearches = [
            query,
            ...state.search.recentSearches.filter(s => s !== query)
          ].slice(0, 10) // Keep only last 10 searches

          return {
            search: {
              ...state.search,
              recentSearches
            }
          }
        })
      },

      clearRecentSearches: () => {
        set((state) => ({
          search: {
            ...state.search,
            recentSearches: []
          }
        }))
      },

      // Loading state management
      setLoading: (key, isLoading) => {
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: isLoading
          }
        }))
      },

      setGlobalLoading: (isLoading) => {
        set((state) => ({
          loading: {
            ...state.loading,
            global: isLoading
          }
        }))
      },

      // Onboarding management
      completeOnboardingStep: (step) => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            completedSteps: [...state.onboarding.completedSteps, step],
            currentStep: Math.max(state.onboarding.currentStep, step + 1)
          }
        }))
      },

      setOnboardingStep: (step) => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            currentStep: step
          }
        }))
      },

      markWelcomeSeen: () => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasSeenWelcome: true
          }
        }))
      },

      toggleHints: () => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            showHints: !state.onboarding.showHints
          }
        }))
      },

      resetOnboarding: () => {
        set({
          onboarding: {
            hasSeenWelcome: false,
            completedSteps: [],
            currentStep: 0,
            showHints: true
          }
        })
      },

      // Workspace management
      setActivePanel: (panel) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            activePanel: panel
          }
        }))
      },

      toggleSplitView: () => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            splitView: !state.workspace.splitView
          }
        }))
      },

      toggleFullscreen: () => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            fullscreen: !state.workspace.fullscreen
          }
        }))
      },

      setZoom: (zoom) => {
        set((state) => ({
          workspace: {
            ...state.workspace,
            zoom: Math.max(50, Math.min(200, zoom))
          }
        }))
      },

      // Utility functions
      getUnreadNotificationCount: () => {
        return get().notifications.filter(n => !n.read).length
      },

      isOnboardingComplete: () => {
        const { onboarding } = get()
        return onboarding.hasSeenWelcome && onboarding.completedSteps.length >= 5
      },

      getSearchHistory: () => {
        return get().search.recentSearches
      },

      // Reset all UI state
      reset: () => {
        set({
          sidebarOpen: false,
          mobileMenuOpen: false,
          modals: Object.keys(get().modals).reduce((acc, key) => ({
            ...acc,
            [key]: false
          }), {}),
          notifications: [],
          search: {
            query: '',
            filters: {},
            results: [],
            isSearching: false,
            recentSearches: []
          },
          loading: {
            global: false,
            projects: false,
            chat: false,
            deployment: false,
            integration: false
          },
          workspace: {
            activePanel: 'chat',
            splitView: false,
            fullscreen: false,
            zoom: 100
          }
        })
      }
    }),
    {
      name: 'ai-tempo-ui',
      partialize: (state) => ({
        layout: state.layout,
        notificationSettings: state.notificationSettings,
        onboarding: state.onboarding,
        search: {
          recentSearches: state.search.recentSearches
        },
        workspace: state.workspace
      }),
      version: 1
    }
  )
)

export { useUIStore }