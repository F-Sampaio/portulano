import { defineStore } from 'pinia'
import { getCurrentUser } from '../services/userService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
  actions: {
    setUser(user) { this.user = user },
    async fetchMe() {
      this.loading = true
      this.error = null
      try {
        const data = await getCurrentUser()
        this.user = data
      } catch (err) {
        this.error = 'Não foi possível carregar o usuário'
      } finally {
        this.loading = false
      }
    },
    clear() { this.user = null },
  },
  getters: {
    isAdmin: (state) => {
      if (!state.user) return true
      if (state.user.role === 'viewer') return false
      return true
    },
  }
})
