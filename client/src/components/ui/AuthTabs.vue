<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/user'
import { api } from '@/lib/api'

// Login state
const loginEmail = ref<string>('')
const loginPassword = ref<string>('')
const loginLoading = ref<boolean>(false)
const loginError = ref<string>('')
const rememberMe = ref<boolean>(false)

// Register state
const name = ref<string>('')
const registerEmail = ref<string>('')
const registerPassword = ref<string>('')
const confirmPassword = ref<string>('')
const acceptTerms = ref<boolean>(false)
const registerLoading = ref<boolean>(false)
const registerError = ref<string>('')

// Active tab state
const activeTab = ref<string>('login')

const router = useRouter()

// Login handler
const handleLogin = async () => {
  loginError.value = ''
  loginLoading.value = true
  
  try {
    // Create login request payload
    const loginData: LoginRequest = {
      email: loginEmail.value,
      password: loginPassword.value
    }

    // Make API call using our axios-based api client
    const response = await api.post<{token: string, user: any}>('/auth/login', loginData, { requiresAuth: false })

    localStorage.setItem('token', response.token)
    localStorage.setItem('isAdmin', (response.user.is_admin === 1).toString())
    
    // Redirect based on user role
    if (response.user.is_admin) {
      toast.success(`Welcome back, ${response.user.name}!`, {
        description: 'You have been redirected to the admin dashboard.'
      })
      router.push('/admin')
    } else {
      toast.success(`Welcome back, ${response.user.name}!`, {
        description: 'Welcome back to Event Hub.'
      })
      router.push('/events')
    }
    
    loginLoading.value = false
  } catch (err:any) {
    console.log("Login error:", err)
    loginError.value = 'Login failed. Please check your credentials.'
    toast.error(err.response?.data.message , {
      description: 'Please check your credentials and try again.'
    })
    loginLoading.value = false
  }
}

// Register handler
const handleRegister = async () => {
  // Validate password match
  if (registerPassword.value !== confirmPassword.value) {
    registerError.value = 'Passwords do not match'
    toast.error('Registration error', {
      description: 'Passwords do not match. Please try again.'
    })
    return
  }
  
  registerError.value = ''
  registerLoading.value = true
  
  try {
    // Create register request payload
    const registerData: RegisterRequest = {
      name: name.value,
      email: registerEmail.value,
      password: registerPassword.value
    }

    // Make API call using our axios-based api client
    await api.post('/auth/register', registerData, { requiresAuth: false })
    
    // Show success notification
    toast.success('Registration successful!', {
      description: 'Your account has been created. You can now log in.'
    })
    
    // Switch to login tab after successful registration
    activeTab.value = 'login'
    registerLoading.value = false
    
    // Pre-fill login email with the registered email for convenience
    loginEmail.value = registerEmail.value
  } catch (err: any) {
    registerError.value = err.response?.data?.message || 'Registration failed. Please try again.'
    toast.error('Registration failed', {
      description: err.response?.data?.message || 'Please try again later.'
    })
    registerLoading.value = false
  }
}
</script>

<template>
  <Card class="mx-auto max-w-md">
    <CardHeader class="text-center pb-2">
      <CardTitle class="text-2xl">Event Hub</CardTitle>
      <CardDescription>Manage your account</CardDescription>
    </CardHeader>
    
    <Tabs v-model="activeTab" class="w-full">
      <div class="px-6">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
      </div>
      
      <!-- Login Tab -->
      <TabsContent value="login" class="mt-4">
        <CardContent>
          <div v-if="loginError" class="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {{ loginError }}
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-1">
              <label for="login-email" class="block text-sm font-medium">Email</label>
              <input
                id="login-email"
                v-model="loginEmail"
                type="email"
                class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div class="space-y-1">
              <label for="login-password" class="block text-sm font-medium">Password</label>
              <input
                id="login-password"
                v-model="loginPassword"
                type="password"
                class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
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
              
              <a href="#" class="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            
            <Button 
              type="submit" 
              class="w-full justify-center"
              :disabled="loginLoading"
            >
              <span v-if="loginLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
              <span v-else>Sign in</span>
            </Button>
          </form>
        </CardContent>
      </TabsContent>
      
      <!-- Register Tab -->
      <TabsContent value="register" class="mt-4">
        <CardContent>
          <div v-if="registerError" class="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {{ registerError }}
          </div>
          
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div class="space-y-1">
              <label for="name" class="block text-sm font-medium">Full Name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div class="space-y-1">
              <label for="register-email" class="block text-sm font-medium">Email</label>
              <input
                id="register-email"
                v-model="registerEmail"
                type="email"
                class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div class="space-y-1">
              <label for="register-password" class="block text-sm font-medium">Password</label>
              <input
                id="register-password"
                v-model="registerPassword"
                type="password"
                class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
                minlength="8"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div class="space-y-1">
              <label for="confirm-password" class="block text-sm font-medium">Confirm Password</label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
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
                I agree to the <a href="#" class="text-primary hover:underline">Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>
            
            <Button 
              type="submit" 
              class="w-full justify-center"
              :disabled="registerLoading || !acceptTerms"
            >
              <span v-if="registerLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Register</span>
            </Button>
          </form>
        </CardContent>
      </TabsContent>
    </Tabs>
    
    <CardFooter>
      <div class="text-center w-full text-xs text-muted-foreground">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </div>
    </CardFooter>
  </Card>
</template>