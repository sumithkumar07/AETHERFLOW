import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { integrationsAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useIntegrationStore = create(
  persist(
    (set, get) => ({
      integrations: [],
      userIntegrations: [],
      categories: {},
      loading: false,
      
      loadIntegrations: async (category = null, popularOnly = false, freeOnly = false) => {
        set({ loading: true })
        try {
          const response = await integrationsAPI.getIntegrations(category, popularOnly, freeOnly)
          set({ 
            integrations: response.integrations,
            categories: response.categories,
            loading: false 
          })
        } catch (error) {
          console.error('Error loading integrations:', error)
          toast.error('Failed to load integrations')
          set({ loading: false })
        }
      },
      
      loadUserIntegrations: async () => {
        try {
          const response = await integrationsAPI.getUserIntegrations()
          set({ userIntegrations: response.integrations })
        } catch (error) {
          console.error('Error loading user integrations:', error)
          toast.error('Failed to load configured integrations')
        }
      },
      
      getIntegration: async (integrationId) => {
        try {
          const response = await integrationsAPI.getIntegration(integrationId)
          return response.integration
        } catch (error) {
          console.error('Error loading integration:', error)
          toast.error('Failed to load integration details')
          return null
        }
      },
      
      configureIntegration: async (integrationId, config) => {
        try {
          const response = await integrationsAPI.configureIntegration(integrationId, config)
          
          // Update user integrations in state
          set(state => {
            const existingIndex = state.userIntegrations.findIndex(
              ui => ui.integration_id === integrationId
            )
            
            if (existingIndex >= 0) {
              // Update existing
              const updated = [...state.userIntegrations]
              updated[existingIndex] = response.config
              return { userIntegrations: updated }
            } else {
              // Add new
              return { 
                userIntegrations: [...state.userIntegrations, response.config] 
              }
            }
          })
          
          toast.success('Integration configured successfully!')
          return response.config
        } catch (error) {
          console.error('Error configuring integration:', error)
          toast.error('Failed to configure integration')
          return null
        }
      },
      
      removeIntegration: async (integrationId) => {
        try {
          await integrationsAPI.removeIntegration(integrationId)
          
          set(state => ({
            userIntegrations: state.userIntegrations.filter(
              ui => ui.integration_id !== integrationId
            )
          }))
          
          toast.success('Integration removed successfully!')
        } catch (error) {
          console.error('Error removing integration:', error)
          toast.error('Failed to remove integration')
        }
      },
      
      testIntegration: async (integrationId) => {
        try {
          const response = await integrationsAPI.testIntegration(integrationId)
          
          if (response.test_result.status === 'success') {
            toast.success(`✅ ${response.test_result.message}`)
          } else {
            toast.error(`❌ ${response.test_result.message}`)
          }
          
          return response.test_result
        } catch (error) {
          console.error('Error testing integration:', error)
          toast.error('Failed to test integration')
          return { status: 'error', message: 'Test failed' }
        }
      },
      
      getIntegrationsByCategory: (category) => {
        return get().integrations.filter(i => i.category === category)
      },
      
      getConfiguredIntegrations: () => {
        return get().userIntegrations.filter(ui => ui.is_active)
      },
      
      isIntegrationConfigured: (integrationId) => {
        return get().userIntegrations.some(
          ui => ui.integration_id === integrationId && ui.is_active
        )
      }
    }),
    {
      name: 'integration-storage',
      partialize: (state) => ({
        userIntegrations: state.userIntegrations
      })
    }
  )
)