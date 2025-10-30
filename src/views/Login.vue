<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="50" color="#409EFF"><Box /></el-icon>
        <h2>工厂仓库管理系统</h2>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="demo-accounts">
        <el-divider>测试账号</el-divider>
        <div class="account-list">
          <el-tag @click="fillAccount('boss', '123456')">老板: boss / 123456</el-tag>
          <el-tag @click="fillAccount('admin', '123456')" type="success">管理员: admin / 123456</el-tag>
          <el-tag @click="fillAccount('engineer', '123456')" type="warning">工程师: engineer / 123456</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Box } from '@element-plus/icons-vue'
import { authAPI } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const fillAccount = (username, password) => {
  loginForm.username = username
  loginForm.password = password
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await authAPI.login(loginForm)
        if (res.code === 200) {
          userStore.setUser(res.data)
          ElMessage.success('登录成功')
          
          // 根据角色跳转到不同页面
          if (res.data.role === 'boss') {
            router.push('/dashboard/boss/overview')
          } else if (res.data.role === 'admin') {
            router.push('/dashboard/admin/materials')
          } else if (res.data.role === 'engineer') {
            router.push('/dashboard/engineer/apply')
          }
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin-top: 15px;
  color: #333;
  font-size: 24px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.demo-accounts {
  margin-top: 20px;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.account-list .el-tag {
  cursor: pointer;
  padding: 10px;
  font-size: 13px;
  transition: all 0.3s;
}

.account-list .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>

