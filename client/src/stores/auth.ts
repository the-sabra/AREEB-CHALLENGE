import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/user'
import { api } from '@/lib/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const tokenExpiry = ref<number | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && (tokenExpiry.value ? tokenExpiry.value > Date.now() : true))
  const isAdmin = computed(() => {
    if (!user.value) return false
    console.log('user.value', (user.value as any).user.is_admin)
    return (user.value as any).user.is_admin == 1;
  })
  const currentUser = computed(() => user.value)

  // Initialize store from localStorage
  function initializeStore() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    // const storedExpiry = localStorage.getItem('tokenExpiry')
    // const storedRefreshToken = localStorage.getItem('refreshToken')
    
    if (storedToken) token.value = storedToken
    if (storedUser) user.value = JSON.parse(storedUser)
    // if (storedExpiry) tokenExpiry.value = parseInt(storedExpiry)
    // if (storedRefreshToken) refreshToken.value = storedRefreshToken
    
    // Check token expiration
    // if (tokenExpiry.value && tokenExpiry.value <= Date.now()) {
    //   if (refreshToken.value) {
    //     refreshAuthToken()
    //   } else {
    //     clearUserData()
    //   }
    // }
  }

  // Actions
  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      
      setUserData(response.token, response.user)
      return response
    } catch (err: any) {
      handleError(err, 'Failed to login')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData: RegisterRequest) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/register', userData)
      return response
    } catch (err: any) {
      handleError(err, 'Failed to register')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
      return true
    } catch (err) {
      console.error('Logout error:', err)
      return false
    } finally {
      clearUserData()
      loading.value = false
    }
  }

  async function checkAuth() {
    if (loading.value) return isAuthenticated.value
    
    loading.value = true
    
    const storedToken = localStorage.getItem('token')
    
    if (!storedToken) {
      clearUserData()
      loading.value = false
      return false
    }
    
    token.value = storedToken
    
    // // Check token expiration
    // const expiry = localStorage.getItem('tokenExpiry')
    // if (expiry && parseInt(expiry) <= Date.now()) {
    //   if (refreshToken.value) {
    //     return await refreshAuthToken()
    //   } else {
    //     clearUserData()
    //     loading.value = false
    //     return false
    //   }
    // }
    
    try {
      const userData = await api.get<User>('/auth/me')
      user.value = userData
      loading.value = false
      return true
    } catch (err) {
      clearUserData()
      loading.value = false
      return false
    }
  }

  // async function refreshAuthToken() {
  //   if (!refreshToken.value) return false
    
  //   try {
  //     const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken: refreshToken.value })
  //     const expiryTime = response.expiresIn ? Date.now() + response.expiresIn * 1000 : null
      
  //     setUserData(response.token, response.user, expiryTime, response.refreshToken)
  //     loading.value = false
  //     return true
  //   } catch (err) {
  //     clearUserData()
  //     loading.value = false
  //     return false
  //   }
  // }

  // Helper functions
  function setUserData(authToken: string, userData: User, expiry: number | null = null, refresh: string | null = null) {
    token.value = authToken
    user.value = userData
    tokenExpiry.value = expiry
    refreshToken.value = refresh
    
    // Store in localStorage
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    if (expiry) localStorage.setItem('tokenExpiry', expiry.toString())
    if (refresh) localStorage.setItem('refreshToken', refresh)
  }

  function clearUserData() {
    user.value = null
    token.value = null
    refreshToken.value = null
    tokenExpiry.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiry')
    localStorage.removeItem('refreshToken')
  }

  function handleError(err: any, defaultMessage: string) {
    error.value = err.response?.data?.message || defaultMessage
  }

  // Initialize store when created
  initializeStore()

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    currentUser,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearUserData,
  }
})