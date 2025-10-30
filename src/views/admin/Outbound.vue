<template>
  <div class="outbound-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>出库管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增出库</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="物资名称">
          <el-input v-model="queryForm.material" placeholder="请输入物资名称" clearable />
        </el-form-item>
        
        <el-form-item label="出库类型">
          <el-select v-model="queryForm.type" placeholder="请选择出库类型" clearable>
            <el-option label="领用" value="领用" />
            <el-option label="借用" value="借用" />
            <el-option label="调拨" value="调拨" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table :data="outboundData" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="orderNo" label="出库单号" width="150" />
        <el-table-column prop="material" label="物资名称" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="type" label="出库类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recipient" label="领用人" width="100" />
        <el-table-column prop="purpose" label="用途" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="outboundTime" label="出库时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待审核'" link type="success" @click="handleApprove(row)">审核</el-button>
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
    
    <!-- 新增出库对话框 -->
    <el-dialog v-model="dialogVisible" title="新增出库" width="700px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="物资名称" prop="materialId">
          <el-select v-model="form.materialId" placeholder="请选择物资" style="width: 100%" filterable>
            <el-option v-for="item in materialOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="出库类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择出库类型" style="width: 100%">
            <el-option label="领用" value="领用" />
            <el-option label="借用" value="借用" />
            <el-option label="调拨" value="调拨" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="领用人" prop="recipient">
          <el-input v-model="form.recipient" placeholder="请输入领用人" />
        </el-form-item>
        
        <el-form-item label="用途" prop="purpose">
          <el-input v-model="form.purpose" placeholder="请输入用途" />
        </el-form-item>
        
        <el-form-item label="出库时间" prop="outboundTime">
          <el-date-picker v-model="form.outboundTime" type="datetime" placeholder="选择出库时间" style="width: 100%" />
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
    
    <!-- 审核对话框 -->
    <el-dialog v-model="approveVisible" title="出库审核" width="500px">
      <el-form label-width="100px">
        <el-form-item label="出库单号">{{ currentRow.orderNo }}</el-form-item>
        <el-form-item label="物资名称">{{ currentRow.material }}</el-form-item>
        <el-form-item label="出库数量">{{ currentRow.quantity }} {{ currentRow.unit }}</el-form-item>
        <el-form-item label="领用人">{{ currentRow.recipient }}</el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="approveResult">
            <el-radio label="通过">通过</el-radio>
            <el-radio label="拒绝">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="approveRemark" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApproveSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Search, Refresh, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = ref({ material: '', type: '' })
const loading = ref(false)
const pagination = ref({ page: 1, size: 10, total: 30 })

const outboundData = ref([
  { id: 1, orderNo: 'OUT202510300001', material: '钢材Q235', quantity: 100, unit: '吨', type: '领用', recipient: '王五', purpose: '项目建设', status: '已完成', outboundTime: '2025-10-30 13:15' },
  { id: 2, orderNo: 'OUT202510290002', material: '水泥425', quantity: 200, unit: '袋', type: '领用', recipient: '赵六', purpose: '车间维修', status: '待审核', outboundTime: '2025-10-29 14:10' },
  { id: 3, orderNo: 'OUT202510280003', material: '电线BV2.5', quantity: 500, unit: '米', type: '借用', recipient: '孙七', purpose: '临时用电', status: '已完成', outboundTime: '2025-10-28 11:30' }
])

const materialOptions = ref([
  { id: 1, name: '钢材Q235' },
  { id: 2, name: '水泥425' },
  { id: 3, name: '电线BV2.5' }
])

const dialogVisible = ref(false)
const approveVisible = ref(false)
const formRef = ref(null)
const currentRow = ref({})
const approveResult = ref('通过')
const approveRemark = ref('')

const form = reactive({
  materialId: null,
  quantity: 1,
  type: '',
  recipient: '',
  purpose: '',
  outboundTime: new Date(),
  remark: ''
})

const rules = {
  materialId: [{ required: true, message: '请选择物资', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
  type: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  recipient: [{ required: true, message: '请输入领用人', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入用途', trigger: 'blur' }]
}

const getTypeColor = (type) => {
  const colorMap = { '领用': 'primary', '借用': 'warning', '调拨': 'info' }
  return colorMap[type] || 'info'
}

const getStatusColor = (status) => {
  const colorMap = { '待审核': 'warning', '已完成': 'success', '已拒绝': 'danger' }
  return colorMap[status] || 'info'
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => { loading.value = false; ElMessage.success('查询成功') }, 500)
}

const handleReset = () => {
  queryForm.value = { material: '', type: '' }
  handleQuery()
}

const handleAdd = () => { dialogVisible.value = true }
const handleView = (row) => { ElMessage.info('查看出库详情：' + row.orderNo) }

const handleApprove = (row) => {
  currentRow.value = row
  approveVisible.value = true
}

const handleApproveSubmit = () => {
  ElMessage.success('审核成功')
  approveVisible.value = false
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该出库记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => { ElMessage.success('删除成功') })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('出库成功')
      dialogVisible.value = false
    }
  })
}

const handleDialogClose = () => { formRef.value?.resetFields() }
</script>

<style scoped>
.outbound-container {
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

