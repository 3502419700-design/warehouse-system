<template>
  <div class="records-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作记录查询</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="操作人员">
          <el-input v-model="queryForm.operator" placeholder="请输入操作人员" clearable />
        </el-form-item>
        
        <el-form-item label="操作类型">
          <el-select v-model="queryForm.type" placeholder="请选择操作类型" clearable>
            <el-option label="入库" value="inbound" />
            <el-option label="出库" value="outbound" />
            <el-option label="盘点" value="check" />
            <el-option label="申请" value="apply" />
            <el-option label="审核" value="approve" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table :data="recordsData" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="time" label="操作时间" width="180" sortable />
        <el-table-column prop="operator" label="操作人员" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="material" label="物资名称" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="description" label="操作说明" min-width="200" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleQuery"
        @current-change="handleQuery"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="操作详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作时间">{{ currentRecord.time }}</el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ currentRecord.operator }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="getRoleType(currentRecord.role)">{{ getRoleText(currentRecord.role) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getTypeColor(currentRecord.type)">{{ getTypeText(currentRecord.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物资名称">{{ currentRecord.material }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ currentRecord.quantity }}</el-descriptions-item>
        <el-descriptions-item label="操作说明" :span="2">{{ currentRecord.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentRecord.ip }}</el-descriptions-item>
        <el-descriptions-item label="设备信息">{{ currentRecord.device }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const queryForm = ref({
  operator: '',
  type: '',
  dateRange: []
})

const loading = ref(false)

const pagination = ref({
  page: 1,
  size: 10,
  total: 100
})

const recordsData = ref([
  { time: '2025-10-30 14:30:25', operator: '张三', role: 'admin', type: 'inbound', material: '钢材Q235', quantity: 500, description: '采购入库，供应商：XX钢铁公司', ip: '192.168.1.100', device: 'Windows 10' },
  { time: '2025-10-30 13:15:18', operator: '李四', role: 'admin', type: 'outbound', material: '水泥425', quantity: 200, description: '项目领用，项目编号：P2025001', ip: '192.168.1.101', device: 'Windows 10' },
  { time: '2025-10-30 11:20:42', operator: '王五', role: 'engineer', type: 'apply', material: '电线BV2.5', quantity: 300, description: '工程申请，用于车间改造', ip: '192.168.1.102', device: 'Windows 10' },
  { time: '2025-10-30 10:05:33', operator: '赵六', role: 'admin', type: 'approve', material: '油漆', quantity: 50, description: '审核通过，申请人：孙七', ip: '192.168.1.103', device: 'Windows 10' },
  { time: '2025-10-30 09:30:15', operator: '孙七', role: 'engineer', type: 'apply', material: '螺丝M8', quantity: 1000, description: '设备维修申请', ip: '192.168.1.104', device: 'Windows 10' },
  { time: '2025-10-29 16:45:22', operator: '张三', role: 'admin', type: 'check', material: '钢材Q235', quantity: 150, description: '月度盘点，实际库存与系统一致', ip: '192.168.1.100', device: 'Windows 10' },
  { time: '2025-10-29 15:20:11', operator: '李四', role: 'admin', type: 'inbound', material: '水泥425', quantity: 1000, description: '采购入库，供应商：YY水泥厂', ip: '192.168.1.101', device: 'Windows 10' },
  { time: '2025-10-29 14:10:05', operator: '王五', role: 'engineer', type: 'outbound', material: '电线BV2.5', quantity: 500, description: '项目领用，已审核通过', ip: '192.168.1.102', device: 'Windows 10' },
  { time: '2025-10-29 11:30:48', operator: '赵六', role: 'admin', type: 'approve', material: '油漆', quantity: 100, description: '审核通过，申请人：王五', ip: '192.168.1.103', device: 'Windows 10' },
  { time: '2025-10-29 09:15:33', operator: '孙七', role: 'engineer', type: 'apply', material: '螺丝M8', quantity: 2000, description: '生产线维护申请', ip: '192.168.1.104', device: 'Windows 10' }
])

const detailVisible = ref(false)
const currentRecord = ref({})

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  queryForm.value = {
    operator: '',
    type: '',
    dateRange: []
  }
  handleQuery()
}

const handleViewDetail = (row) => {
  currentRecord.value = row
  detailVisible.value = true
}

const getRoleType = (role) => {
  const typeMap = { boss: 'danger', admin: 'success', engineer: 'warning' }
  return typeMap[role] || 'info'
}

const getRoleText = (role) => {
  const textMap = { boss: '老板', admin: '管理员', engineer: '工程人员' }
  return textMap[role] || '未知'
}

const getTypeColor = (type) => {
  const colorMap = {
    inbound: 'success',
    outbound: 'warning',
    check: 'info',
    apply: 'primary',
    approve: 'success'
  }
  return colorMap[type] || 'info'
}

const getTypeText = (type) => {
  const textMap = {
    inbound: '入库',
    outbound: '出库',
    check: '盘点',
    apply: '申请',
    approve: '审核'
  }
  return textMap[type] || '未知'
}
</script>

<style scoped>
.records-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.table-card {
  margin-top: 0;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

