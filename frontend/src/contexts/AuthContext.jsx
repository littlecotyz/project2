import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const initialize = useAuthStore((state) => state.initialize)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    initialize()
  }, [initialize])

  const value = useMemo(
    () => ({ user, isAuthenticated, login, register, logout }),
    [user, isAuthenticated, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
