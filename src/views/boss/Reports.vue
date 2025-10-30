<template>
  <div class="reports-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报表查询</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="报表类型">
          <el-select v-model="queryForm.type" placeholder="请选择报表类型" @change="handleTypeChange">
            <el-option label="库存报表" value="inventory" />
            <el-option label="出入库报表" value="inout" />
            <el-option label="人员操作报表" value="operation" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
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
          <el-button :icon="Download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 库存报表 -->
    <el-card v-if="queryForm.type === 'inventory'" class="report-card">
      <template #header>
        <div class="card-header">
          <span>库存明细报表</span>
        </div>
      </template>
      
      <el-table :data="inventoryData" stripe border>
        <el-table-column prop="materialName" label="物资名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="specification" label="规格" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="库存数量" width="100" />
        <el-table-column prop="price" label="单价(元)" width="100" />
        <el-table-column prop="totalValue" label="总价值(元)" width="120">
          <template #default="{ row }">
            ¥{{ (row.quantity * row.price).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" />
      </el-table>
      
      <div class="summary">
        <el-statistic title="库存总价值" :value="inventoryTotalValue" prefix="¥" />
      </div>
    </el-card>
    
    <!-- 出入库报表 -->
    <el-card v-if="queryForm.type === 'inout'" class="report-card">
      <template #header>
        <div class="card-header">
          <span>出入库汇总报表</span>
        </div>
      </template>
      
      <el-table :data="inoutData" stripe border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="materialName" label="物资名称" />
        <el-table-column prop="inboundQty" label="入库数量" width="100" />
        <el-table-column prop="outboundQty" label="出库数量" width="100" />
        <el-table-column prop="balance" label="结余" width="100">
          <template #default="{ row }">
            <span :class="row.balance >= 0 ? 'positive' : 'negative'">
              {{ row.balance }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="经办人" width="100" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>
    
    <!-- 人员操作报表 -->
    <el-card v-if="queryForm.type === 'operation'" class="report-card">
      <template #header>
        <div class="card-header">
          <span>人员操作统计报表</span>
        </div>
      </template>
      
      <el-table :data="operationData" stripe border>
        <el-table-column prop="username" label="操作人员" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inboundCount" label="入库次数" width="100" />
        <el-table-column prop="outboundCount" label="出库次数" width="100" />
        <el-table-column prop="checkCount" label="盘点次数" width="100" />
        <el-table-column prop="totalOperations" label="总操作数" width="100" />
        <el-table-column prop="accuracy" label="准确率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.accuracy" :color="getAccuracyColor(row.accuracy)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastOperation" label="最后操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const queryForm = ref({
  type: 'inventory',
  dateRange: []
})

const inventoryData = ref([
  { materialName: '钢材Q235', category: '钢材', specification: '6m*200mm', unit: '吨', quantity: 150, price: 4500, location: 'A区-01' },
  { materialName: '水泥425', category: '水泥', specification: '50kg/袋', unit: '袋', quantity: 2000, price: 25, location: 'B区-03' },
  { materialName: '电线BV2.5', category: '电线', specification: '2.5平方', unit: '米', quantity: 5000, price: 3.5, location: 'C区-05' },
  { materialName: '油漆', category: '涂料', specification: '5L/桶', unit: '桶', quantity: 300, price: 120, location: 'D区-02' },
  { materialName: '螺丝M8', category: '五金', specification: 'M8*50', unit: '个', quantity: 10000, price: 0.5, location: 'E区-01' }
])

const inoutData = ref([
  { date: '2025-10-30', materialName: '钢材Q235', inboundQty: 50, outboundQty: 30, balance: 20, operator: '张三', remark: '正常' },
  { date: '2025-10-29', materialName: '水泥425', inboundQty: 500, outboundQty: 300, balance: 200, operator: '李四', remark: '正常' },
  { date: '2025-10-28', materialName: '电线BV2.5', inboundQty: 1000, outboundQty: 800, balance: 200, operator: '王五', remark: '正常' },
  { date: '2025-10-27', materialName: '油漆', inboundQty: 100, outboundQty: 120, balance: -20, operator: '赵六', remark: '超额领用' }
])

const operationData = ref([
  { username: '张三', role: 'admin', inboundCount: 45, outboundCount: 38, checkCount: 12, totalOperations: 95, accuracy: 98, lastOperation: '2025-10-30 14:30' },
  { username: '李四', role: 'admin', inboundCount: 52, outboundCount: 41, checkCount: 15, totalOperations: 108, accuracy: 96, lastOperation: '2025-10-30 13:15' },
  { username: '王五', role: 'engineer', inboundCount: 0, outboundCount: 28, checkCount: 0, totalOperations: 28, accuracy: 95, lastOperation: '2025-10-30 11:20' },
  { username: '赵六', role: 'engineer', inboundCount: 0, outboundCount: 22, checkCount: 0, totalOperations: 22, accuracy: 92, lastOperation: '2025-10-30 10:05' }
])

const inventoryTotalValue = computed(() => {
  return inventoryData.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
})

const handleTypeChange = () => {
  // 切换报表类型时的处理
}

const handleQuery = () => {
  ElMessage.success('查询成功')
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const getRoleType = (role) => {
  const typeMap = { boss: 'danger', admin: 'success', engineer: 'warning' }
  return typeMap[role] || 'info'
}

const getRoleText = (role) => {
  const textMap = { boss: '老板', admin: '管理员', engineer: '工程人员' }
  return textMap[role] || '未知'
}

const getAccuracyColor = (accuracy) => {
  if (accuracy >= 95) return '#67C23A'
  if (accuracy >= 90) return '#E6A23C'
  return '#F56C6C'
}
</script>

<style scoped>
.reports-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.report-card {
  margin-top: 20px;
}

.summary {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.positive {
  color: #67C23A;
  font-weight: bold;
}

.negative {
  color: #F56C6C;
  font-weight: bold;
}
</style>

