<template>
  <div class="applications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>物资申请审核</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingData" stripe border v-loading="loading">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="applyNo" label="申请单号" width="150" />
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="material" label="物资名称" />
            <el-table-column prop="quantity" label="申请数量" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="purpose" label="用途" min-width="150" />
            <el-table-column prop="applyTime" label="申请时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="success" @click="handleApprove(row, '通过')">通过</el-button>
                <el-button link type="danger" @click="handleApprove(row, '拒绝')">拒绝</el-button>
                <el-button link type="primary" @click="handleView(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已通过" name="approved">
          <el-table :data="approvedData" stripe border>
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="applyNo" label="申请单号" width="150" />
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="material" label="物资名称" />
            <el-table-column prop="quantity" label="申请数量" width="100" />
            <el-table-column prop="approver" label="审核人" width="100" />
            <el-table-column prop="approveTime" label="审核时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已拒绝" name="rejected">
          <el-table :data="rejectedData" stripe border>
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="applyNo" label="申请单号" width="150" />
            <el-table-column prop="applicant" label="申请人" width="100" />
            <el-table-column prop="material" label="物资名称" />
            <el-table-column prop="quantity" label="申请数量" width="100" />
            <el-table-column prop="approver" label="审核人" width="100" />
            <el-table-column prop="rejectReason" label="拒绝原因" min-width="150" />
            <el-table-column prop="approveTime" label="审核时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="approveVisible" :title="approveTitle" width="600px">
      <el-form label-width="100px">
        <el-form-item label="申请单号">{{ currentRow.applyNo }}</el-form-item>
        <el-form-item label="申请人">{{ currentRow.applicant }}</el-form-item>
        <el-form-item label="物资名称">{{ currentRow.material }}</el-form-item>
        <el-form-item label="申请数量">{{ currentRow.quantity }} {{ currentRow.unit }}</el-form-item>
        <el-form-item label="用途">{{ currentRow.purpose }}</el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="approveRemark" type="textarea" :rows="3" :placeholder="approveAction === '通过' ? '请输入审核意见（可选）' : '请输入拒绝原因'" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button :type="approveAction === '通过' ? 'success' : 'danger'" @click="handleApproveSubmit">
          确认{{ approveAction }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const activeTab = ref('pending')
const loading = ref(false)

const pendingData = ref([
  { id: 1, applyNo: 'APP202510300001', applicant: '王五', material: '钢材Q235', quantity: 100, unit: '吨', purpose: '项目建设需要', applyTime: '2025-10-30 10:20' },
  { id: 2, applyNo: 'APP202510290002', applicant: '孙七', material: '水泥425', quantity: 500, unit: '袋', purpose: '车间地面修复', applyTime: '2025-10-29 14:35' },
  { id: 3, applyNo: 'APP202510280003', applicant: '王五', material: '电线BV2.5', quantity: 300, unit: '米', purpose: '设备线路改造', applyTime: '2025-10-28 09:15' }
])

const approvedData = ref([
  { id: 4, applyNo: 'APP202510270004', applicant: '孙七', material: '油漆', quantity: 50, unit: '桶', approver: '张三', approveTime: '2025-10-27 15:20' },
  { id: 5, applyNo: 'APP202510260005', applicant: '王五', material: '螺丝M8', quantity: 1000, unit: '个', approver: '李四', approveTime: '2025-10-26 11:30' }
])

const rejectedData = ref([
  { id: 6, applyNo: 'APP202510250006', applicant: '孙七', material: '钢材Q235', quantity: 500, unit: '吨', approver: '张三', rejectReason: '库存不足', approveTime: '2025-10-25 16:45' }
])

const approveVisible = ref(false)
const approveTitle = ref('')
const approveAction = ref('')
const approveRemark = ref('')
const currentRow = ref({})

const handleTabChange = () => {
  // 切换标签页时的处理
}

const handleApprove = (row, action) => {
  currentRow.value = row
  approveAction.value = action
  approveTitle.value = action === '通过' ? '审核通过' : '审核拒绝'
  approveRemark.value = ''
  approveVisible.value = true
}

const handleApproveSubmit = () => {
  if (approveAction.value === '拒绝' && !approveRemark.value) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  ElMessage.success(`审核${approveAction.value}成功`)
  approveVisible.value = false
  
  // 从待审核列表中移除
  const index = pendingData.value.findIndex(item => item.id === currentRow.value.id)
  if (index > -1) {
    pendingData.value.splice(index, 1)
  }
  
  // 添加到对应列表
  if (approveAction.value === '通过') {
    approvedData.value.unshift({
      ...currentRow.value,
      approver: userStore.username,
      approveTime: new Date().toLocaleString('zh-CN')
    })
  } else {
    rejectedData.value.unshift({
      ...currentRow.value,
      approver: userStore.username,
      rejectReason: approveRemark.value,
      approveTime: new Date().toLocaleString('zh-CN')
    })
  }
}

const handleView = (row) => {
  ElMessage.info('查看申请详情：' + row.applyNo)
}
</script>

<style scoped>
.applications-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>

