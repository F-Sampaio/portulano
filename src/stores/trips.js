import { defineStore } from 'pinia'
import { createTrip, listTrips, deleteTrip } from '../services/tripService'


export const useTripsStore = defineStore('trips', {
  state: () => ({
    items: [],
    total: 0,
    q: '',
    status: '',
    page: 1,
    pageSize: 10,
    loading: false,
    error: null
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const data = await listTrips()
        this.items = data
        this.total = data.length
      } catch (e) {
        this.error = e?.message || 'Falha ao carregar viagens'
      } finally {
        this.loading = false
      }
    },
    async addTrip(payload) {
      const body = {
        title: payload.name,
        description: null,
        status: payload.status,
        startDate: payload.startDate || null,
        endDate: null,
      }
      await createTrip(body)
      await this.load()
    },
    async removeTrip(id) {
      await deleteTrip(id)
      await this.load()
    },
    setQuery(q) { this.q = q; this.page = 1 },
    setStatus(s) { this.status = s; this.page = 1 },
    setPage(p) { this.page = p }
  },
  getters: {
    pageCount: (s) => Math.max(1, Math.ceil(s.total / s.pageSize))
  }
})
