import api from './api'

export async function listTrips() {
  const response = await api.get('/trips')
  return response.data
}

export async function createTrip(payload) {
  // payload: { name, startDate, endDate, origin, destination, ... }
  const response = await api.post('/trips', payload)
  return response.data
}

export async function deleteTrip(id) {
  const response = await api.delete(`/trips/${id}`)
  return response.data
}


export async function getTripById(id) {
  const response = await api.get(`/trips/${id}`)
  return response.data
}

export async function addDay(tripId, payload) {
  const response = await api.post(`/trips/${tripId}/days`, payload)
  return response.data
}

export async function updateDay(tripId, dayId, payload) {
  const response = await api.patch(`/trips/${tripId}/days/${dayId}`, payload)
  return response.data
}

export async function deleteDay(tripId, dayId) {
  const response = await api.delete(`/trips/${tripId}/days/${dayId}`)
  return response.data
}

// export async function addChecklistItem(tripId, payload) {
//   // payload: { title, description, done }
//   const response = await api.post(`/trips/${tripId}/checklist`, payload)
//   return response.data
// }

export async function addChecklistItem(tripId, label) {
  const response = await api.post(`/trips/${tripId}/checklist`, {
    label,
  })
  return response.data
}

export async function toggleChecklistItem(tripId, itemId) {
  const response = await api.patch(
    `/trips/${tripId}/checklist/${itemId}/toggle`,
  )
  return response.data
}

export async function updateChecklistItem(tripId, itemId, label) {
  const response = await api.patch(`/trips/${tripId}/checklist/${itemId}`, {
    label,
  })
  return response.data
}

export async function deleteChecklistItem(tripId, itemId) {
  const response = await api.delete(`/trips/${tripId}/checklist/${itemId}`)
  return response.data
}

export async function joinTripByCode(code) {
  const response = await api.post('/trips/join', { code })
  return response.data
}

