import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fetchTasks = () => api.get('/tasks/')
export const createTask = (task) => api.post('/tasks/', task)
export const updateTask = (id, task) => api.put(`/tasks/${id}/`, task)
export const deleteTask = (id) => api.delete(`/tasks/${id}/`)
