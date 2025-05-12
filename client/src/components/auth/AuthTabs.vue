<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { LoginRequest, RegisterRequest } from '@/types/user'
import { useAuthStore } from '@/stores/auth'

// store
const authStore = useAuthStore()

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
const registerLoading = ref<boolean>(false)
const registerError = ref<string>('')

// Active tab state
const activeTab = ref<string>('login')

// Form validation states
const isLoginEmailValid = computed(() => {
  if (!loginEmail.value) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.value)
})

const isRegisterEmailValid = computed(() => {
  if (!registerEmail.value) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.value)
})

const passwordStrength = computed(() => {
  if (!registerPassword.value) return { score: 0, text: '', color: '' }
  
  const password = registerPassword.value
  let score = 0
  
  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  let text = ''
  let color = ''
  
  switch (true) {
    case (score <= 2):
      text = 'Weak'
      color = 'bg-destructive'
      break
    case (score <= 4):
      text = 'Medium'
      color = 'bg-amber-500'
      break
    default:
      text = 'Strong'
      color = 'bg-emerald-500'
  }

  return { score: Math.min(score, 6), text, color }
})

const isPasswordMatch = computed(() => {
  if (!confirmPassword.value) return null
  return registerPassword.value === confirmPassword.value
})

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

    const response = await authStore.login(loginData)

    
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

// Check for remembered email on component mount
if (localStorage.getItem('rememberedEmail')) {
  loginEmail.value = localStorage.getItem('rememberedEmail') || ''
  rememberMe.value = true
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
    const response = await authStore.register(registerData)
    
    registerLoading.value = false

    toast.success(`Welcome, ${response.user.name}!`, {
        description: 'Welcome back to Event Hub.'
    })
    
    router.push('/events')  
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
  <Card class="mx-auto max-w-md shadow-md dark:shadow-primary/5">
    <CardHeader class="text-center pb-2">
      <CardTitle class="text-2xl font-bold">Event Hub</CardTitle>
      <CardDescription>Sign in to your account or create a new one</CardDescription>
    </CardHeader>
    
    <Tabs v-model="activeTab" class="w-full">
      <div class="px-6">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="login" class="transition-all duration-200">Sign In</TabsTrigger>
          <TabsTrigger value="register" class="transition-all duration-200">Register</TabsTrigger>
        </TabsList>
      </div>
      
      <!-- Login Tab -->
      <TabsContent value="login" class="mt-4 animate-in fade-in-50 slide-in-from-left-5 duration-300">
        <CardContent>
          <div v-if="loginError" class="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {{ loginError }}
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-1">
              <label for="login-email" class="block text-sm font-medium">Email</label>
              <div class="relative">
                <input
                  id="login-email"
                  v-model="loginEmail"
                  type="email"
                  class="w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  :class="{ 
                    'border-destructive focus:ring-destructive/50': isLoginEmailValid === false,
                    'border-emerald-500 focus:ring-emerald-500/50': isLoginEmailValid === true,
                    'border-input': isLoginEmailValid === null
                  }"
                  placeholder="you@example.com"
                  required
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
              </div>
            </div>
            
            <div class="space-y-1">
              <label for="login-password" class="block text-sm font-medium">Password</label>
              <div class="relative">
                <input
                  id="login-password"
                  v-model="loginPassword"
                  type="password"
                  class="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              class="w-full justify-center transition-all duration-200"
              :disabled="loginLoading"
            >
              <span v-if="loginLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
              <span v-else>Sign in</span>
            </Button>
          </form>
        </CardContent>
      </TabsContent>
      
      <!-- Register Tab -->
      <TabsContent value="register" class="mt-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
        <CardContent>
          <div v-if="registerError" class="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {{ registerError }}
          </div>
          
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div class="space-y-1">
              <label for="name" class="block text-sm font-medium">Full Name</label>
              <div class="relative">
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  class="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="John Doe"
                  required
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
              </div>
            </div>
            
            <div class="space-y-1">
              <label for="register-email" class="block text-sm font-medium">Email</label>
              <div class="relative">
                <input
                  id="register-email"
                  v-model="registerEmail"
                  type="email"
                  class="w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  :class="{ 
                    'border-destructive focus:ring-destructive/50': isRegisterEmailValid === false,
                    'border-emerald-500 focus:ring-emerald-500/50': isRegisterEmailValid === true,
                    'border-input': isRegisterEmailValid === null
                  }"
                  placeholder="you@example.com"
                  required
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <span v-if="isRegisterEmailValid === false" class="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                </span>
                <span v-if="isRegisterEmailValid === true" class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
              </div>
            </div>
            
            <div class="space-y-1">
              <label for="register-password" class="block text-sm font-medium">Password</label>
              <div class="relative">
                <input
                  id="register-password"
                  v-model="registerPassword"
                  type="password"
                  class="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                  minlength="8"
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
              </div>
              
              <!-- Password strength indicator -->
              <div v-if="registerPassword" class="mt-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium">Password strength: {{ passwordStrength.text }}</span>
                </div>
                <div class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-300" 
                    :class="passwordStrength.color"
                    :style="{ width: `${(passwordStrength.score / 6) * 100}%` }"
                  ></div>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500" :class="{ 'text-muted-foreground': registerPassword.length < 8 }"><path d="M20 6 9 17l-5-5"/></svg>
                    At least 8 characters
                  </div>
                  <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500" :class="{ 'text-muted-foreground': !/[A-Z]/.test(registerPassword) }"><path d="M20 6 9 17l-5-5"/></svg>
                    Uppercase letter
                  </div>
                  <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500" :class="{ 'text-muted-foreground': !/[a-z]/.test(registerPassword) }"><path d="M20 6 9 17l-5-5"/></svg>
                    Lowercase letter
                  </div>
                  <div class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500" :class="{ 'text-muted-foreground': !/[0-9]/.test(registerPassword) }"><path d="M20 6 9 17l-5-5"/></svg>
                    Number
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-1">
              <label for="confirm-password" class="block text-sm font-medium">Confirm Password</label>
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  class="w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  :class="{ 
                    'border-destructive focus:ring-destructive/50': isPasswordMatch === false,
                    'border-emerald-500 focus:ring-emerald-500/50': isPasswordMatch === true,
                    'border-input': isPasswordMatch === null
                  }"
                  placeholder="••••••••"
                  required
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <span v-if="isPasswordMatch === false" class="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                </span>
                <span v-if="isPasswordMatch === true" class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
              </div>
              <p v-if="isPasswordMatch === false" class="text-xs text-destructive mt-1">Passwords do not match</p>
            </div>
            
            <Button 
              type="submit" 
              class="w-full justify-center transition-all duration-200"
              :disabled="registerLoading || (registerPassword && passwordStrength.score < 2)"
            >
              <span v-if="registerLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Create Account</span>
            </Button>
          </form>
        </CardContent>
      </TabsContent>
    </Tabs>
  </Card>
</template>

<style scoped>
.slide-in-from-left-5 {
  --tw-enter-translate-x: -1.25rem;
}

.slide-in-from-right-5 {
  --tw-enter-translate-x: 1.25rem;
}

/* Add smooth transitions */
input, 
button {
  transition: all 0.2s ease;
}

/* Add focus styles for better accessibility */
input:focus {
  box-shadow: 0 0 0 2px rgba(var(--ring), 0.3);
}

/* Custom animation for tab switching */
.animate-in {
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
}

@keyframes fade-in-50 {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>