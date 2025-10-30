<template>
  <div class="materials-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>物资管理</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加物资</el-button>
            <el-button type="success" :icon="Upload" @click="handleImport">批量导入</el-button>
            <el-button type="warning" :icon="Download" @click="handleExport">导出数据</el-button>
          </div>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="物资名称">
          <el-input v-model="queryForm.name" placeholder="请输入物资名称" clearable />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select v-model="queryForm.category" placeholder="请选择分类" clearable>
            <el-option label="钢材" value="钢材" />
            <el-option label="水泥" value="水泥" />
            <el-option label="电线" value="电线" />
            <el-option label="涂料" value="涂料" />
            <el-option label="五金" value="五金" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <el-table :data="materialsData" stripe border v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="物资名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="price" label="单价(元)" width="100" />
        <el-table-column prop="minStock" label="最小库存" width="100" />
        <el-table-column prop="maxStock" label="最大库存" width="100" />
        <el-table-column prop="location" label="存放位置" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
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
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="物资名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物资名称" />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="钢材" value="钢材" />
            <el-option label="水泥" value="水泥" />
            <el-option label="电线" value="电线" />
            <el-option label="涂料" value="涂料" />
            <el-option label="五金" value="五金" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification" placeholder="请输入规格" />
        </el-form-item>
        
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="最小库存" prop="minStock">
          <el-input-number v-model="form.minStock" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="最大库存" prop="maxStock">
          <el-input-number v-model="form.maxStock" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="存放位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入存放位置" />
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
import { Plus, Upload, Download, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = ref({
  name: '',
  category: ''
})

const loading = ref(false)

const pagination = ref({
  page: 1,
  size: 10,
  total: 50
})

const materialsData = ref([
  { id: 1, name: '钢材Q235', category: '钢材', specification: '6m*200mm', unit: '吨', price: 4500, minStock: 50, maxStock: 500, location: 'A区-01' },
  { id: 2, name: '水泥425', category: '水泥', specification: '50kg/袋', unit: '袋', price: 25, minStock: 500, maxStock: 5000, location: 'B区-03' },
  { id: 3, name: '电线BV2.5', category: '电线', specification: '2.5平方', unit: '米', price: 3.5, minStock: 1000, maxStock: 10000, location: 'C区-05' },
  { id: 4, name: '油漆', category: '涂料', specification: '5L/桶', unit: '桶', price: 120, minStock: 100, maxStock: 1000, location: 'D区-02' },
  { id: 5, name: '螺丝M8', category: '五金', specification: 'M8*50', unit: '个', price: 0.5, minStock: 5000, maxStock: 50000, location: 'E区-01' }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加物资')
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  category: '',
  specification: '',
  unit: '',
  price: 0,
  minStock: 0,
  maxStock: 0,
  location: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入物资名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }]
}

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  queryForm.value = { name: '', category: '' }
  handleQuery()
}

const handleAdd = () => {
  dialogTitle.value = '添加物资'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑物资'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该物资吗？', '提示', {
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
      ElMessage.success(dialogTitle.value + '成功')
      dialogVisible.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: null, name: '', category: '', specification: '', unit: '',
    price: 0, minStock: 0, maxStock: 0, location: '', remark: ''
  })
}

const handleImport = () => {
  ElMessage.info('批量导入功能')
}

const handleExport = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.materials-container {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-top: 0;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

