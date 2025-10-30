<template>
  <div class="my-applications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的申请</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="申请状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table :data="applicationsData" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="applyNo" label="申请单号" width="150" />
        <el-table-column prop="material" label="物资名称" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="quantity" label="申请数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="urgency" label="紧急程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getUrgencyColor(row.urgency)">{{ row.urgency }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              :icon="Delete"
              @click="handleCancel(row)"
            >
              撤销
            </el-button>
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
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="申请详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请单号" :span="2">{{ currentRow.applyNo }}</el-descriptions-item>
        <el-descriptions-item label="物资名称">{{ currentRow.material }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ currentRow.specification }}</el-descriptions-item>
        <el-descriptions-item label="申请数量">{{ currentRow.quantity }} {{ currentRow.unit }}</el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getUrgencyColor(currentRow.urgency)">{{ currentRow.urgency }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请状态" :span="2">
          <el-tag :type="getStatusColor(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用途说明" :span="2">{{ currentRow.purpose }}</el-descriptions-item>
        <el-descriptions-item label="预计使用时间" :span="2">{{ currentRow.expectedTime }}</el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">{{ currentRow.applyTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.approver" label="审核人">{{ currentRow.approver }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.approveTime" label="审核时间">{{ currentRow.approveTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.approveRemark" label="审核意见" :span="2">
          {{ currentRow.approveRemark }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.remark" label="备注" :span="2">{{ currentRow.remark }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = ref({
  status: '',
  dateRange: []
})

const loading = ref(false)

const pagination = ref({
  page: 1,
  size: 10,
  total: 30
})

const applicationsData = ref([
  {
    id: 1,
    applyNo: 'APP202510300001',
    material: '钢材Q235',
    specification: '6m*200mm',
    quantity: 100,
    unit: '吨',
    urgency: '紧急',
    status: 'pending',
    purpose: '项目建设需要，用于主体结构施工',
    expectedTime: '2025-11-01 08:00',
    applyTime: '2025-10-30 10:20',
    remark: '请尽快审批'
  },
  {
    id: 2,
    applyNo: 'APP202510290002',
    material: '水泥425',
    specification: '50kg/袋',
    quantity: 500,
    unit: '袋',
    urgency: '普通',
    status: 'approved',
    purpose: '车间地面修复工程',
    expectedTime: '2025-10-31 09:00',
    applyTime: '2025-10-29 14:35',
    approver: '张三',
    approveTime: '2025-10-29 15:20',
    approveRemark: '同意，请按时领取'
  },
  {
    id: 3,
    applyNo: 'APP202510280003',
    material: '电线BV2.5',
    specification: '2.5平方',
    quantity: 300,
    unit: '米',
    urgency: '普通',
    status: 'approved',
    purpose: '设备线路改造，更换老化线路',
    expectedTime: '2025-10-30 14:00',
    applyTime: '2025-10-28 09:15',
    approver: '李四',
    approveTime: '2025-10-28 10:30',
    approveRemark: '审核通过'
  },
  {
    id: 4,
    applyNo: 'APP202510270004',
    material: '油漆',
    specification: '5L/桶',
    quantity: 100,
    unit: '桶',
    urgency: '特急',
    status: 'rejected',
    purpose: '厂房外墙粉刷',
    expectedTime: '2025-10-28 08:00',
    applyTime: '2025-10-27 16:20',
    approver: '张三',
    approveTime: '2025-10-27 17:00',
    approveRemark: '申请数量过多，请重新评估后再申请',
    remark: '紧急项目'
  }
])

const detailVisible = ref(false)
const currentRow = ref({})

const getUrgencyColor = (urgency) => {
  const colorMap = {
    '普通': 'info',
    '紧急': 'warning',
    '特急': 'danger'
  }
  return colorMap[urgency] || 'info'
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return colorMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  queryForm.value = {
    status: '',
    dateRange: []
  }
  handleQuery()
}

const handleView = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要撤销该申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('撤销成功')
    // 从列表中移除
    const index = applicationsData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      applicationsData.value.splice(index, 1)
    }
  })
}
</script>

<style scoped>
.my-applications-container {
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

