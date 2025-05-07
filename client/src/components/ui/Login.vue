<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { LoginRequest, AuthResponse } from '@/types/user'
import { api } from '@/lib/api'

const email = ref<string>('')
const password = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string>('')
const router = useRouter()
const rememberMe = ref<boolean>(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    // Create login request payload
    const loginData: LoginRequest = {
      email: email.value,
      password: password.value
    }
    
    // In a real application, this is how we would make the API call
    // const response = await api.post<AuthResponse>('/auth/login', loginData, { requiresAuth: false })
    // localStorage.setItem('token', response.token)
    // localStorage.setItem('isAdmin', response.user.isAdmin.toString())
    
    // For now, we'll simulate a successful login
    setTimeout(() => {
      // Store the token (will be replaced with actual token from API)
      localStorage.setItem('token', 'sample-jwt-token')
      
      // Check if user is admin (will be determined from API response)
      const isAdmin = email.value.includes('admin')
      if (isAdmin) {
        localStorage.setItem('isAdmin', 'true')
        // Show success notification
        toast.success('Welcome back, Admin!', {
          description: 'You have been redirected to the admin dashboard.'
        })
        // Redirect admin users to the admin dashboard
        router.push('/admin')
      } else {
        localStorage.setItem('isAdmin', 'false')
        // Show success notification
        toast.success('Login successful!', {
          description: 'Welcome back to Event Hub.'
        })
        // Redirect regular users to events page
        router.push('/events')
      }
      
      loading.value = false
    }, 1000)
  } catch (err) {
    error.value = 'Login failed. Please check your credentials.'
    toast.error('Login failed', {
      description: 'Please check your credentials and try again.'
    })
    loading.value = false
  }
}
</script>

<template>
  <Card class="mx-auto max-w-md">
    <CardHeader class="text-center">
      <CardTitle class="text-2xl">Welcome Back</CardTitle>
      <CardDescription>Enter your credentials to access your account</CardDescription>
    </CardHeader>
    
    <CardContent>
      <div v-if="error" class="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium">Email</label>
          <div class="relative">
            <i class="pi pi-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <input
              id="email"
              v-model="email"
              type="email"
              class="w-full pl-10 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium">Password</label>
          <div class="relative">
            <i class="pi pi-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <input
              id="password"
              v-model="password"
              type="password"
              class="w-full pl-10 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              id="remember-me" 
              v-model="rememberMe"
              type="checkbox" 
              class="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm">
              Remember me
            </label>
          </div>
          
          <a href="#" class="text-sm font-medium text-primary hover:underline flex items-center">
            <i class="pi pi-question-circle mr-1 text-sm"></i>
            Forgot password?
          </a>
        </div>
        
        <Button 
          type="submit" 
          class="w-full justify-center"
          :disabled="loading"
        >
          <span v-if="loading">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
          <span v-else>
            <i class="pi pi-sign-in mr-2"></i>
            Sign in
          </span>
        </Button>
      </form>
    </CardContent>
    
    <CardFooter>
      <div class="text-center w-full text-sm">
        Don't have an account?
        <router-link to="/register" class="font-medium text-primary hover:underline ml-1">
          Register now
        </router-link>
      </div>
    </CardFooter>
  </Card>
</template>