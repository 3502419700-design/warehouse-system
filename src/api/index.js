import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          const userStore = useUserStore()
          userStore.clearUser()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求错误，未找到该资源')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data.message || '请求失败')
      }
    }
    return Promise.reject(error)
  }
)

// API 接口
export const authAPI = {
  login: (data) => request.post('/login', data),
  logout: () => request.post('/logout')
}

export const materialAPI = {
  getList: (params) => request.get('/materials', { params }),
  add: (data) => request.post('/materials', data),
  update: (id, data) => request.put(`/materials/${id}`, data),
  delete: (id) => request.delete(`/materials/${id}`),
  import: (data) => request.post('/materials/import', data),
  export: () => request.get('/materials/export', { responseType: 'blob' })
}

export const inventoryAPI = {
  getList: (params) => request.get('/inventory', { params }),
  check: (data) => request.post('/inventory/check', data),
  getAlerts: () => request.get('/inventory/alerts')
}

export const inboundAPI = {
  getList: (params) => request.get('/inbound', { params }),
  add: (data) => request.post('/inbound', data),
  getDetail: (id) => request.get(`/inbound/${id}`)
}

export const outboundAPI = {
  getList: (params) => request.get('/outbound', { params }),
  add: (data) => request.post('/outbound', data),
  approve: (id, data) => request.post(`/outbound/${id}/approve`, data),
  getDetail: (id) => request.get(`/outbound/${id}`)
}

export const applicationAPI = {
  getList: (params) => request.get('/applications', { params }),
  add: (data) => request.post('/applications', data),
  approve: (id, data) => request.post(`/applications/${id}/approve`, data),
  getMyApplications: (params) => request.get('/applications/my', { params })
}

export const userAPI = {
  getList: (params) => request.get('/users', { params }),
  add: (data) => request.post('/users', data),
  update: (id, data) => request.put(`/users/${id}`, data),
  delete: (id) => request.delete(`/users/${id}`)
}

export const reportAPI = {
  getInventoryReport: (params) => request.get('/reports/inventory', { params }),
  getInOutReport: (params) => request.get('/reports/inout', { params }),
  getOperationReport: (params) => request.get('/reports/operation', { params }),
  getStatistics: () => request.get('/reports/statistics')
}

export default request

