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

// Navigation guards for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      next({ path: '/' })
    } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
      // If route requires admin access but user is not admin, redirect to events page
      next({ path: '/events' })
    } else {
      next()
    }
  } else {
    // For non-auth routes (login/auth), redirect to events if already logged in
    if (isAuthenticated && to.path === '/') {
      next({ path: '/events' })
    } else {
      next()
    }
  }
})

const app = createApp(App)
app.use(router)
app.component('Toaster', Toaster)
app.mount('#app')
