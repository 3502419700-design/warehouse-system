<template>
  <div class="inventory-container">
    <el-row :gutter="20" class="alert-row">
      <el-col :span="24">
        <el-alert
          title="库存预警"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            当前有 <strong>{{ alertCount }}</strong> 种物资库存低于最小值，请及时补货！
          </template>
        </el-alert>
      </el-col>
    </el-row>
    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存盘点</span>
          <el-button type="primary" :icon="DocumentAdd" @click="handleStartCheck">开始盘点</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="物资名称">
          <el-input v-model="queryForm.name" placeholder="请输入物资名称" clearable />
        </el-form-item>
        
        <el-form-item label="库存状态">
          <el-select v-model="queryForm.status" placeholder="请选择库存状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="低于最小值" value="low" />
            <el-option label="高于最大值" value="high" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table :data="inventoryData" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="materialName" label="物资名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="currentStock" label="当前库存" width="100" />
        <el-table-column prop="minStock" label="最小库存" width="100" />
        <el-table-column prop="maxStock" label="最大库存" width="100" />
        <el-table-column label="库存状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStockStatusColor(row)">{{ getStockStatus(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleCheck(row)">盘点</el-button>
            <el-button link type="success" :icon="View" @click="handleViewHistory(row)">历史</el-button>
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
    
    <!-- 盘点对话框 -->
    <el-dialog v-model="checkVisible" title="库存盘点" width="600px">
      <el-form ref="formRef" :model="checkForm" :rules="rules" label-width="120px">
        <el-form-item label="物资名称">
          <el-input v-model="currentMaterial.materialName" disabled />
        </el-form-item>
        
        <el-form-item label="系统库存">
          <el-input v-model="currentMaterial.currentStock" disabled>
            <template #append>{{ currentMaterial.unit }}</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="实际库存" prop="actualStock">
          <el-input-number v-model="checkForm.actualStock" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="盘点差异">
          <el-input :value="checkForm.actualStock - currentMaterial.currentStock" disabled>
            <template #append>{{ currentMaterial.unit }}</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="盘点说明" prop="remark">
          <el-input v-model="checkForm.remark" type="textarea" :rows="3" placeholder="请输入盘点说明" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="checkVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCheckSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { DocumentAdd, Search, Refresh, Edit, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const queryForm = ref({
  name: '',
  status: ''
})

const loading = ref(false)

const pagination = ref({
  page: 1,
  size: 10,
  total: 50
})

const inventoryData = ref([
  { id: 1, materialName: '钢材Q235', category: '钢材', specification: '6m*200mm', unit: '吨', currentStock: 150, minStock: 50, maxStock: 500, location: 'A区-01' },
  { id: 2, materialName: '水泥425', category: '水泥', specification: '50kg/袋', unit: '袋', currentStock: 2000, minStock: 500, maxStock: 5000, location: 'B区-03' },
  { id: 3, materialName: '电线BV2.5', category: '电线', specification: '2.5平方', unit: '米', currentStock: 5000, minStock: 1000, maxStock: 10000, location: 'C区-05' },
  { id: 4, materialName: '油漆', category: '涂料', specification: '5L/桶', unit: '桶', currentStock: 80, minStock: 100, maxStock: 1000, location: 'D区-02' },
  { id: 5, materialName: '螺丝M8', category: '五金', specification: 'M8*50', unit: '个', currentStock: 4500, minStock: 5000, maxStock: 50000, location: 'E区-01' }
])

const checkVisible = ref(false)
const formRef = ref(null)
const currentMaterial = ref({})

const checkForm = reactive({
  actualStock: 0,
  remark: ''
})

const rules = {
  actualStock: [{ required: true, message: '请输入实际库存', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入盘点说明', trigger: 'blur' }]
}

const alertCount = computed(() => {
  return inventoryData.value.filter(item => item.currentStock < item.minStock).length
})

const getStockStatus = (row) => {
  if (row.currentStock < row.minStock) return '库存不足'
  if (row.currentStock > row.maxStock) return '库存过高'
  return '正常'
}

const getStockStatusColor = (row) => {
  if (row.currentStock < row.minStock) return 'danger'
  if (row.currentStock > row.maxStock) return 'warning'
  return 'success'
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  queryForm.value = { name: '', status: '' }
  handleQuery()
}

const handleStartCheck = () => {
  ElMessage.info('开始全面盘点')
}

const handleCheck = (row) => {
  currentMaterial.value = row
  checkForm.actualStock = row.currentStock
  checkForm.remark = ''
  checkVisible.value = true
}

const handleCheckSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('盘点成功')
      checkVisible.value = false
    }
  })
}

const handleViewHistory = (row) => {
  ElMessage.info('查看盘点历史：' + row.materialName)
}
</script>

<style scoped>
.inventory-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert-row {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

