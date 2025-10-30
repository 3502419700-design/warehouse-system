<template>
  <div class="inbound-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>入库管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增入库</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="物资名称">
          <el-input v-model="queryForm.material" placeholder="请输入物资名称" clearable />
        </el-form-item>
        
        <el-form-item label="入库时间">
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
      <el-table :data="inboundData" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="orderNo" label="入库单号" width="150" />
        <el-table-column prop="material" label="物资名称" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="operator" label="经办人" width="100" />
        <el-table-column prop="inboundTime" label="入库时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleView(row)">查看</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 新增入库对话框 -->
    <el-dialog v-model="dialogVisible" title="新增入库" width="700px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="物资名称" prop="materialId">
          <el-select v-model="form.materialId" placeholder="请选择物资" style="width: 100%" filterable>
            <el-option
              v-for="item in materialOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>
        
        <el-form-item label="批次号">
          <el-input v-model="form.batchNo" placeholder="请输入批次号" />
        </el-form-item>
        
        <el-form-item label="入库时间" prop="inboundTime">
          <el-date-picker
            v-model="form.inboundTime"
            type="datetime"
            placeholder="选择入库时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Search, Refresh, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = ref({
  material: '',
  dateRange: []
})

const loading = ref(false)

const pagination = ref({
  page: 1,
  size: 10,
  total: 30
})

const inboundData = ref([
  { id: 1, orderNo: 'IN202510300001', material: '钢材Q235', specification: '6m*200mm', quantity: 500, unit: '吨', supplier: 'XX钢铁公司', operator: '张三', inboundTime: '2025-10-30 14:30' },
  { id: 2, orderNo: 'IN202510290002', material: '水泥425', specification: '50kg/袋', quantity: 1000, unit: '袋', supplier: 'YY水泥厂', operator: '李四', inboundTime: '2025-10-29 15:20' },
  { id: 3, orderNo: 'IN202510280003', material: '电线BV2.5', specification: '2.5平方', quantity: 2000, unit: '米', supplier: 'ZZ电缆厂', operator: '张三', inboundTime: '2025-10-28 10:15' }
])

const materialOptions = ref([
  { id: 1, name: '钢材Q235' },
  { id: 2, name: '水泥425' },
  { id: 3, name: '电线BV2.5' },
  { id: 4, name: '油漆' },
  { id: 5, name: '螺丝M8' }
])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  materialId: null,
  quantity: 1,
  supplier: '',
  batchNo: '',
  inboundTime: new Date(),
  remark: ''
})

const rules = {
  materialId: [{ required: true, message: '请选择物资', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  inboundTime: [{ required: true, message: '请选择入库时间', trigger: 'change' }]
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  queryForm.value = { material: '', dateRange: [] }
  handleQuery()
}

const handleAdd = () => {
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看入库详情：' + row.orderNo)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该入库记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('入库成功')
      dialogVisible.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.inbound-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

