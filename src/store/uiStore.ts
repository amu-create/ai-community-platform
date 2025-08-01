import { create } from 'zustand'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Modals
  modals: {
    resourceCreate: boolean
    resourceEdit: boolean
    userProfile: boolean
    settings: boolean
  }
  
  // Toast notifications
  toasts: Toast[]
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  // Modal actions
  openModal: (modalType: keyof UIState['modals']) => void
  closeModal: (modalType: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {
    resourceCreate: false,
    resourceEdit: false,
    userProfile: false,
    settings: false,
  },
  toasts: [],
  theme: 'system',
  
  // Sidebar actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  // Modal actions
  openModal: (modalType) => set((state) => ({
    modals: { ...state.modals, [modalType]: true },
  })),
  closeModal: (modalType) => set((state) => ({
    modals: { ...state.modals, [modalType]: false },
  })),
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => ({
      ...acc,
      [key]: false,
    }), {} as UIState['modals']),
  })),
  
  // Toast actions
  addToast: (toast) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, toast.duration || 5000)
    }
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
  
  // Theme actions
  setTheme: (theme) => set({ theme }),
}))
