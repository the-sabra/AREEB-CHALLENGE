<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'vue-router'
import type { RegisterRequest } from '@/types/user'
import { toast } from 'vue-sonner'
import { api } from '@/lib/api'

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')
const acceptTerms = ref<boolean>(false)
const loading = ref<boolean>(false)
const error = ref<string>('')
const router = useRouter()

const handleRegister = async () => {
  // Validate password match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    toast.error('Registration error', {
      description: 'Passwords do not match. Please try again.'
    })
    return
  }
  
  error.value = ''
  loading.value = true
  
  try {
    // Create registration request payload
    const registerData: RegisterRequest = {
      name: name.value,
      email: email.value,
      password: password.value
    }
    
    // Make API call using our axios-based api client
    await api.post('/auth/register', registerData, { requiresAuth: false })
    
    // Show success notification
    toast.success('Registration successful!', {
      description: 'Your account has been created. Please sign in.'
    })
    
    // Redirect to login page after successful registration
    router.push('/')
    loading.value = false
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
    toast.error('Registration failed', {
      description: err.response?.data?.message || 'Please try again later.'
    })
    loading.value = false
  }
}
</script>

<template>
  <Card class="mx-auto max-w-md">
    <CardHeader class="text-center">
      <CardTitle class="text-2xl">Create Account</CardTitle>
      <CardDescription>Fill in your details to register</CardDescription>
    </CardHeader>
    
    <CardContent>
      <div v-if="error" class="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="space-y-1">
          <label for="name" class="block text-sm font-medium">Full Name</label>
          <div class="relative">
            <i class="pi pi-user absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <input
              id="name"
              v-model="name"
              type="text"
              class="w-full pl-10 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="John Doe"
              required
            />
          </div>
        </div>
        
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
              minlength="8"
            />
          </div>
          <p class="mt-1 text-xs text-muted-foreground flex items-center">
            <i class="pi pi-info-circle mr-1"></i>
            Password must be at least 8 characters long
          </p>
        </div>
        
        <div class="space-y-1">
          <label for="confirm-password" class="block text-sm font-medium">Confirm Password</label>
          <div class="relative">
            <i class="pi pi-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="w-full pl-10 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div class="flex items-center mt-2">
          <input 
            id="terms" 
            v-model="acceptTerms"
            type="checkbox" 
            class="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            required
          />
          <label for="terms" class="ml-2 block text-sm">
            <i class="pi pi-check-circle mr-1 text-muted-foreground"></i>
            I agree to the <a href="#" class="text-primary hover:underline">Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>
        
        <Button 
          type="submit" 
          class="w-full justify-center"
          :disabled="loading || !acceptTerms"
        >
          <span v-if="loading">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
          <span v-else>
            <i class="pi pi-user-plus mr-2"></i>
            Register
          </span>
        </Button>
      </form>
    </CardContent>
    
    <CardFooter>
      <div class="text-center w-full text-sm">
        Already have an account?
        <router-link to="/" class="font-medium text-primary hover:underline ml-1">
          Sign in
        </router-link>
      </div>
    </CardFooter>
  </Card>
</template>