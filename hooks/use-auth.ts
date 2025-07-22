"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  username: string
  role: string
  loginTime: string
}

interface AuthToken {
  value: string
  expires: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const tokenData = localStorage.getItem("admin_token")
      const userData = localStorage.getItem("admin_user")

      if (!tokenData || !userData) {
        setIsLoading(false)
        return
      }

      const token: AuthToken = JSON.parse(tokenData)
      const user: User = JSON.parse(userData)
      const now = new Date().getTime()

      // Verificar se o token expirou
      if (now > token.expires) {
        logout()
        return
      }

      setUser(user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = (username: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simular validação (em produção, seria uma chamada para API)
      setTimeout(() => {
        if (username === "admin" && password === "admin123") {
          const token: AuthToken = {
            value: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            expires: new Date().getTime() + 24 * 60 * 60 * 1000, // 24 horas
          }

          const user: User = {
            username,
            role: "admin",
            loginTime: new Date().toISOString(),
          }

          localStorage.setItem("admin_token", JSON.stringify(token))
          localStorage.setItem("admin_user", JSON.stringify(user))

          setUser(user)
          setIsAuthenticated(true)
          resolve(true)
        } else {
          resolve(false)
        }
      }, 1000)
    })
  }

  const logout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    setUser(null)
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push("/admin/login")
      return false
    }
    return true
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    requireAuth,
    checkAuthStatus,
  }
}
