import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = ref(stored ? stored === 'dark' : prefersDark)

  function applyTheme (dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  function toggle () {
    isDark.value = !isDark.value
  }

  // Watch and apply
  watch(isDark, applyTheme, { immediate: true })

  // Listen for system preference changes (only if user hasn't explicitly set one)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
    }
  }
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  }

  return { isDark, toggle }
})