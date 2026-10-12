import api from './axios'

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const studentApi = {
  listAll: () => api.get('/students'),
  listMine: () => api.get('/wali/students'),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
}

export const savingApi = {
  listByStudent: (studentId) => api.get(`/students/${studentId}/savings`),
  balance: (studentId) => api.get(`/students/${studentId}/savings/balance`),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
}

export const withdrawalApi = {
  listAll: () => api.get('/withdrawals'),
  listMine: () => api.get('/wali/withdrawals'),
  get: (id) => api.get(`/withdrawals/${id}`),
  create: (data) => api.post('/wali/withdrawals', data),
  review: (id, data) => api.patch(`/withdrawals/${id}/review`, data),
  delete: (id) => api.delete(`/withdrawals/${id}`),
}

export const reminderApi = {
  get: () => api.get('/wali/reminder'),
  upsert: (data) => api.put('/wali/reminder', data),
}
