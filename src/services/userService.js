import api from './api'

export async function createUser(data) {
  const response = await api.post('/users', data)
  return response.data
}

export async function getUserById(id) {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get('/me')
  return response.data
}

export async function updateName(payload) {
  const response = await api.patch('/me/name', payload)
  return response.data
}

export async function updateEmail(payload) {
  const response = await api.patch('/me/email', payload)
  return response.data
}

export async function updatePassword(payload) {
  const response = await api.patch('/me/password', payload)
  return response.data
}
