import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Verification, Document } from '@/types'

// Auth store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      logout: async () => {
        try {
          // Import AuthService dynamically to avoid circular dependencies
          const { AuthService } = await import('./appwrite-service')
          await AuthService.signOut()
        } catch (error) {
          console.error('Error during logout:', error)
        } finally {
          // Always clear the local state
          set({ user: null, isAuthenticated: false, error: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// UI store
interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarOpen: false,
      notifications: [],
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2)
        const newNotification = { ...notification, id }
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))
        
        // Auto-remove notification after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, notification.duration || 5000)
        }
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)

// Verification store
interface VerificationState {
  verifications: Verification[]
  documents: Document[]
  isLoading: boolean
  error: string | null
  filters: {
    status: string
    documentType: string
    dateFrom: string
    dateTo: string
    search: string
  }
  setVerifications: (verifications: Verification[]) => void
  addVerification: (verification: Verification) => void
  updateVerification: (id: string, updates: Partial<Verification>) => void
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<VerificationState['filters']>) => void
  clearFilters: () => void
}

export const useVerificationStore = create<VerificationState>()((set, get) => ({
  verifications: [],
  documents: [],
  isLoading: false,
  error: null,
  filters: {
    status: '',
    documentType: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  setVerifications: (verifications) => set({ verifications }),
  addVerification: (verification) =>
    set((state) => ({
      verifications: [verification, ...state.verifications],
    })),
  updateVerification: (id, updates) =>
    set((state) => ({
      verifications: state.verifications.map((v) =>
        v.$id === id ? { ...v, ...updates } : v
      ),
    })),
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) =>
    set((state) => ({
      documents: [document, ...state.documents],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearFilters: () =>
    set({
      filters: {
        status: '',
        documentType: '',
        dateFrom: '',
        dateTo: '',
        search: '',
      },
    }),
}))

// API store for managing API calls and caching
interface APIState {
  cache: Record<string, { data: any; timestamp: number; ttl: number }>
  pendingRequests: Set<string>
  addToCache: (key: string, data: any, ttl?: number) => void
  getFromCache: (key: string) => any | null
  clearCache: (key?: string) => void
  addPendingRequest: (key: string) => void
  removePendingRequest: (key: string) => void
  isPending: (key: string) => boolean
}

export const useAPIStore = create<APIState>()((set, get) => ({
  cache: {},
  pendingRequests: new Set(),
  addToCache: (key, data, ttl = 5 * 60 * 1000) => // 5 minutes default
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          data,
          timestamp: Date.now(),
          ttl,
        },
      },
    })),
  getFromCache: (key) => {
    const state = get()
    const cached = state.cache[key]
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      state.clearCache(key)
      return null
    }
    
    return cached.data
  },
  clearCache: (key) => {
    if (key) {
      set((state) => {
        const newCache = { ...state.cache }
        delete newCache[key]
        return { cache: newCache }
      })
    } else {
      set({ cache: {} })
    }
  },
  addPendingRequest: (key) =>
    set((state) => ({
      pendingRequests: new Set(Array.from(state.pendingRequests).concat([key])),
    })),
  removePendingRequest: (key) =>
    set((state) => {
      const newPending = new Set(state.pendingRequests)
      newPending.delete(key)
      return { pendingRequests: newPending }
    }),
  isPending: (key) => get().pendingRequests.has(key),
}))

// Settings store
interface SettingsState {
  settings: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    dateFormat: string
    timeFormat: '12h' | '24h'
  }
  updateSettings: (settings: Partial<SettingsState['settings']>) => void
  resetSettings: () => void
}

const defaultSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  theme: 'system' as const,
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'settings-storage',
    }
  )
) 