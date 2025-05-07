<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const activeTab = ref('account')
const name = ref('Pedro Duarte')
const username = ref('@peduarte')
const loading = ref(false)

const saveChanges = async () => {
  loading.value = true
  
  // Simulate API request
  setTimeout(() => {
    loading.value = false
    toast.success('Settings saved', {
      description: 'Your account has been updated successfully.'
    })
  }, 1000)
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <Card class="bg-[#121212] text-white border-gray-800">
      <div>
        <!-- Tabs -->
        <div class="mx-auto">
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid grid-cols-2 bg-[#222] rounded-none p-0 h-14">
              <TabsTrigger 
                value="account" 
                class="rounded-none h-full data-[state=active]:bg-[#121212] data-[state=active]:border-b-0 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-white"
              >
                Account
              </TabsTrigger>
              
              <TabsTrigger 
                value="password"
                class="rounded-none h-full data-[state=active]:bg-[#121212] data-[state=active]:border-b-0 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-white"
              >
                Password
              </TabsTrigger>
            </TabsList>
            
            <!-- Account Tab -->
            <TabsContent value="account" class="p-6">
              <h2 class="text-xl font-bold mb-1">Account</h2>
              <p class="text-gray-400 mb-6">Make changes to your account here. Click save when you're done.</p>
              
              <form @submit.prevent="saveChanges" class="space-y-6">
                <div class="space-y-2">
                  <label for="name" class="block text-sm font-medium text-gray-200">Name</label>
                  <input
                    id="name"
                    v-model="name"
                    type="text"
                    class="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                
                <div class="space-y-2">
                  <label for="username" class="block text-sm font-medium text-gray-200">Username</label>
                  <input
                    id="username"
                    v-model="username"
                    type="text"
                    class="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  class="bg-white text-black hover:bg-gray-200 px-4 py-2"
                >
                  <span v-if="loading">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                  <span v-else>Save changes</span>
                </Button>
              </form>
            </TabsContent>
            
            <!-- Password Tab -->
            <TabsContent value="password" class="p-6">
              <h2 class="text-xl font-bold mb-1">Password</h2>
              <p class="text-gray-400 mb-6">Change your password here. After saving, you'll be logged out.</p>
              
              <form @submit.prevent="saveChanges" class="space-y-6">
                <div class="space-y-2">
                  <label for="current-password" class="block text-sm font-medium text-gray-200">Current password</label>
                  <input
                    id="current-password"
                    type="password"
                    class="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                    placeholder="••••••••"
                  />
                </div>
                
                <div class="space-y-2">
                  <label for="new-password" class="block text-sm font-medium text-gray-200">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    class="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                    placeholder="••••••••"
                  />
                </div>
                
                <div class="space-y-2">
                  <label for="confirm-password" class="block text-sm font-medium text-gray-200">Confirm password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    class="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                    placeholder="••••••••"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  class="bg-white text-black hover:bg-gray-200 px-4 py-2"
                >
                  <span v-if="loading">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                  <span v-else>Save password</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  </div>
</template>