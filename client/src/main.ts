import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import 'primeicons/primeicons.css';
import App from './App.vue'
import AuthTabs from '@/components/ui/AuthTabs.vue'
import EventsList from '@/components/ui/events/EventsList.vue'
import EventDetail from '@/components/ui/events/EventDetail.vue'
import Admin from '@/components/ui/admin/Admin.vue'
import AdminEventManagement from '@/components/ui/admin/AdminEventManagement.vue'
import AdminUserManagement from '@/components/ui/admin/AdminUserManagement.vue'
import { Toaster } from '@/components/ui/sonner'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', component: AuthTabs },
  { 
    path: '/events', 
    component: EventsList,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/events/:id', 
    component: EventDetail,
    meta: { requiresAuth: true }
  },
  { 
    path: '/admin', 
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { 
        path: '', 
        redirect: { name: 'admin-events' }
      },
      { 
        path: 'events', 
        name: 'admin-events',
        component: AdminEventManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      { 
        path: 'users', 
        name: 'admin-users',
        component: AdminUserManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Create Pinia instance
const pinia = createPinia()

// Create app and use Pinia BEFORE setting up navigation guards
const app = createApp(App)
app.use(pinia)

// Navigation guards for authentication
router.beforeEach(async (to, from, next) => {
  // Get auth store instance
  const authStore = useAuthStore()
  
  // Check if we need to verify authentication status
  if (!authStore.isAuthenticated) {
    // Try to restore session from token in localStorage
    await authStore.checkAuth()
  }
  
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next({ path: '/' })
      return
    } 
    
    // Check admin requirement
    if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
      // If route requires admin access but user is not admin, redirect to events page
      next({ path: '/events' })
      return
    }
    
    // User is authenticated and has required permissions
    next()
  } else {
    // For non-auth routes (login/register)
    if (authStore.isAuthenticated) {
      if (authStore.currentUser?.is_admin && to.path === '/') {
        next({ path: '/admin' })
        return
      } else if (!authStore.currentUser?.is_admin && to.path === '/') {
        next({ path: '/events' })
        return
      }
    }
    
    // Allow access to non-auth routes
    next()
  }
})

// Add router and register global components
app.use(router)
app.component('Toaster', Toaster)

app.mount('#app')
