import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')
  const userId = ref(localStorage.getItem('userId') || '')

  function setUser(data) {
    token.value = data.token
    username.value = data.username
    role.value = data.role
    userId.value = data.userId
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role', data.role)
    localStorage.setItem('userId', data.userId)
  }

  function clearUser() {
    token.value = ''
    username.value = ''
    role.value = ''
    userId.value = ''
    
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
  }

  return {
    token,
    username,
    role,
    userId,
    setUser,
    clearUser
  }
})

