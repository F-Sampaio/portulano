import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

const TOKEN_KEY = 'portulano_token'

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})


export async function getTrip(id) {
  const res = await api.get(`/trips/${id}`)
  return res.data
}


export async function addChecklistItem(tripId, payload) {
  const data = typeof payload === 'string'
    ? { label: payload }
    : payload

  const res = await api.post(`/trips/${tripId}/checklist`, data)
  return res.data
}

export async function toggleCheckItem(tripId, itemId) {
  const res = await api.patch(`/trips/${tripId}/checklist/${itemId}/toggle`)
  return res.data
}

export async function updateCheckItem(tripId, itemId, label) {
  const res = await api.patch(`/trips/${tripId}/checklist/${itemId}`, {
    label,
  })
  return res.data
}

export async function deleteCheckItem(tripId, itemId) {
  const res = await api.delete(`/trips/${tripId}/checklist/${itemId}`)
  return res.data
}

export async function addDay(tripId, payload) {
  // payload: { title, from, to, distanceKm, eta, notes }
  const res = await api.post(`/trips/${tripId}/days`, payload)
  return res.data
}

export async function updateDay(tripId, dayId, payload) {
  const res = await api.patch(`/trips/${tripId}/days/${dayId}`, payload)
  return res.data
}

export async function deleteDay(tripId, dayId) {
  const res = await api.delete(`/trips/${tripId}/days/${dayId}`)
  return res.data
}



export async function updateTrip(id, data) {
  const res = await api.patch(`/trips/${id}`, data)
  return res.data
}

export async function createInvite(tripId, payload) {
  const res = await api.post(`/trips/${tripId}/invites`, payload)
  return res.data
}

export async function joinTripByCode(code) {
  const res = await api.post('/trips/join', { code })
  return res.data
}


export default api
