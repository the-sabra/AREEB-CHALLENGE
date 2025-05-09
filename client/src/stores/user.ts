import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { api } from '@/lib/api'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const sortedUsers = computed(() => {
    return [...users.value].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  const adminUsers = computed(() => {
    return users.value.filter(user => user.is_admin === 1)
  })
  
  // Actions
  async function fetchUsers() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get<{users: User[]}>('/admin/users')
      users.value = response.users
      return response.users
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function getUserById(userId: number) {
    // Check if user already exists in store
    const existingUser = users.value.find(user => user.id === userId)
    
    if (existingUser) {
      return existingUser
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get<User>(`/admin/users/${userId}`)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function toggleAdminStatus(userId: number, isAdmin: boolean) {
    loading.value = true
    error.value = null
    
    try {
      await api.put(`/admin/users/${userId}/toggle-admin`, { isAdmin })
      
      // Update user in store
      const userIndex = users.value.findIndex(user => user.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = isAdmin ? 1 : 0
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update user admin status'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function sendPasswordReset(userId: number) {
    loading.value = true
    error.value = null
    
    try {
      await api.post(`/admin/users/${userId}/reset-password`)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to send password reset'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function cancelRegistration(userId: number, eventId: number) {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/admin/users/${userId}/events/${eventId}`)
      
      // Update user in store
      // const userIndex = users.value.findIndex(user => user.id === userId)
    //   if (userIndex !== -1) {
    //     users.value[userIndex].registeredEvents = users.value[userIndex].registeredEvents.filter(id => id !== eventId)
    //   }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to cancel registration'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    users,
    loading,
    error,
    
    // Getters
    sortedUsers,
    adminUsers,
    
    // Actions
    fetchUsers,
    getUserById,
    toggleAdminStatus,
    sendPasswordReset,
    cancelRegistration
  }
})