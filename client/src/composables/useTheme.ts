import { ref, computed, onMounted, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

// State that will be preserved between component unmounts
const isDarkMode = ref(false)
const theme = ref<Theme>('system')

export function useTheme() {
  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
  
  // Check if user has already set a preference
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      theme.value = savedTheme
    }
    
    updateTheme()
    
    // Watch for system theme changes
    systemDarkMode.addEventListener('change', updateTheme)
  })
  
  function updateTheme() {
    if (theme.value === 'system') {
      isDarkMode.value = systemDarkMode.matches
    } else {
      isDarkMode.value = theme.value === 'dark'
    }
    
    applyTheme()
  }
  
  function applyTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    updateTheme()
  }
  
  function toggleTheme() {
    const newTheme = isDarkMode.value ? 'light' : 'dark'
    setTheme(newTheme)
  }
  
  // Watch for theme changes
  watch(theme, updateTheme)
  
  return {
    theme,
    isDark: computed(() => isDarkMode.value),
    setTheme,
    toggleTheme
  }
}