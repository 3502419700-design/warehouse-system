<template>
  <el-container class="dashboard-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <el-icon v-if="!isCollapse" :size="30"><Box /></el-icon>
        <span v-if="!isCollapse">仓库系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :router="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <template v-for="item in menuList" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute">{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-tag :type="roleType">{{ roleText }}</el-tag>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.username }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  Box, Fold, Expand, User, ArrowDown,
  DataAnalysis, Document, Operation, Goods,
  Upload, Download, List, Setting, EditPen, Tickets
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = ref(route.path)

// 根据角色显示不同菜单
const menuList = computed(() => {
  const role = userStore.role
  
  if (role === 'boss') {
    return [
      { path: '/dashboard/boss/overview', title: '数据总览', icon: DataAnalysis },
      { path: '/dashboard/boss/reports', title: '统计报表', icon: Document },
      { path: '/dashboard/boss/records', title: '操作记录', icon: List }
    ]
  } else if (role === 'admin') {
    return [
      { path: '/dashboard/admin/materials', title: '物资管理', icon: Goods },
      { path: '/dashboard/admin/inbound', title: '入库管理', icon: Upload },
      { path: '/dashboard/admin/outbound', title: '出库管理', icon: Download },
      { path: '/dashboard/admin/inventory', title: '库存盘点', icon: Operation },
      { path: '/dashboard/admin/applications', title: '申请审核', icon: Tickets },
      { path: '/dashboard/admin/users', title: '人员管理', icon: Setting }
    ]
  } else if (role === 'engineer') {
    return [
      { path: '/dashboard/engineer/apply', title: '物资申请', icon: EditPen },
      { path: '/dashboard/engineer/my-applications', title: '我的申请', icon: List }
    ]
  }
  
  return []
})

const roleText = computed(() => {
  const roleMap = {
    boss: '老板',
    admin: '管理员',
    engineer: '工程人员'
  }
  return roleMap[userStore.role] || '未知'
})

const roleType = computed(() => {
  const typeMap = {
    boss: 'danger',
    admin: 'success',
    engineer: 'warning'
  }
  return typeMap[userStore.role] || 'info'
})

const currentRoute = computed(() => {
  const item = menuList.value.find(m => m.path === route.path)
  return item?.title || ''
})

watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.clearUser()
      router.push('/login')
    })
  }
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.el-menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-icon:hover {
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

