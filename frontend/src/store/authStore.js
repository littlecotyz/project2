import create from 'zustand'
import axios from 'axios'

const STORAGE_KEY = 'tm_auth'

const readStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const writeStorage = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const getAuthState = () => readStorage()

export const setAuthState = (state) => {
  writeStorage(state)
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  initialize: () => {
    const stored = readStorage()
    if (stored?.accessToken && stored?.refreshToken) {
      set({
        user: stored.user,
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        isAuthenticated: true,
      })
    }
  },

  setAuth: ({ user, accessToken, refreshToken }) => {
    const nextState = {
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }
    writeStorage(nextState)
    set(nextState)
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  login: async ({ username, password }) => {
    const response = await apiClient.post('/auth/login/', {
      username,
      password,
    })
    const { access, refresh, user } = response.data
    get().setAuth({ user, accessToken: access, refreshToken: refresh })
    return response.data
  },

  register: async ({ username, email, password }) => {
    const response = await apiClient.post('/auth/register/', {
      username,
      email,
      password,
    })
    const { access, refresh, user } = response.data
    get().setAuth({ user, accessToken: access, refreshToken: refresh })
    return response.data
  },

  logout: async () => {
    const { refreshToken } = get()
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout/', { refresh: refreshToken })
      } catch (_error) {
        // ignore logout errors, clear local state anyway
      }
    }
    get().clearAuth()
  },
}))

export default useAuthStore
