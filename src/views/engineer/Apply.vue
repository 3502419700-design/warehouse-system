<template>
  <div class="apply-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>物资申请</span>
        </div>
      </template>
      
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="max-width: 800px">
        <el-form-item label="物资名称" prop="materialId">
          <el-select
            v-model="form.materialId"
            placeholder="请选择物资"
            style="width: 100%"
            filterable
            @change="handleMaterialChange"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.id"
              :label="`${item.name} (库存: ${item.stock}${item.unit})`"
              :value="item.id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                库存: {{ item.stock }}{{ item.unit }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="物资规格">
          <el-input v-model="selectedMaterial.specification" disabled />
        </el-form-item>
        
        <el-form-item label="当前库存">
          <el-input v-model="stockInfo" disabled>
            <template #append>{{ selectedMaterial.unit }}</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="申请数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            :max="selectedMaterial.stock"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="用途说明" prop="purpose">
          <el-input
            v-model="form.purpose"
            type="textarea"
            :rows="4"
            placeholder="请详细说明物资用途，如项目名称、使用场景等"
          />
        </el-form-item>
        
        <el-form-item label="预计使用时间" prop="expectedTime">
          <el-date-picker
            v-model="form.expectedTime"
            type="datetime"
            placeholder="选择预计使用时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="紧急程度" prop="urgency">
          <el-radio-group v-model="form.urgency">
            <el-radio label="普通">普通</el-radio>
            <el-radio label="紧急">紧急</el-radio>
            <el-radio label="特急">特急</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="其他需要说明的信息（可选）"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Check" @click="handleSubmit" :loading="submitting">
            提交申请
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="tips-card">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>申请须知</span>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item timestamp="第一步" placement="top">
          <p>选择需要申请的物资，查看当前库存情况</p>
        </el-timeline-item>
        <el-timeline-item timestamp="第二步" placement="top">
          <p>填写申请数量和详细的用途说明</p>
        </el-timeline-item>
        <el-timeline-item timestamp="第三步" placement="top">
          <p>提交申请后，等待管理员审核</p>
        </el-timeline-item>
        <el-timeline-item timestamp="第四步" placement="top">
          <p>审核通过后，可前往仓库领取物资</p>
        </el-timeline-item>
      </el-timeline>
      
      <el-alert
        title="温馨提示"
        type="info"
        :closable="false"
        style="margin-top: 20px"
      >
        <ul style="margin: 10px 0; padding-left: 20px">
          <li>请根据实际需求填写申请数量，避免浪费</li>
          <li>紧急申请会优先处理，请合理选择紧急程度</li>
          <li>用途说明越详细，审核通过率越高</li>
          <li>申请提交后可在"我的申请"中查看审核进度</li>
        </ul>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Check, Refresh, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)

const materialOptions = ref([
  { id: 1, name: '钢材Q235', specification: '6m*200mm', unit: '吨', stock: 150 },
  { id: 2, name: '水泥425', specification: '50kg/袋', unit: '袋', stock: 2000 },
  { id: 3, name: '电线BV2.5', specification: '2.5平方', unit: '米', stock: 5000 },
  { id: 4, name: '油漆', specification: '5L/桶', unit: '桶', stock: 300 },
  { id: 5, name: '螺丝M8', specification: 'M8*50', unit: '个', stock: 10000 }
])

const selectedMaterial = ref({
  specification: '',
  unit: '',
  stock: 0
})

const form = reactive({
  materialId: null,
  quantity: 1,
  purpose: '',
  expectedTime: null,
  urgency: '普通',
  remark: ''
})

const rules = {
  materialId: [{ required: true, message: '请选择物资', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入申请数量', trigger: 'blur' }],
  purpose: [
    { required: true, message: '请输入用途说明', trigger: 'blur' },
    { min: 10, message: '用途说明不能少于10个字', trigger: 'blur' }
  ],
  expectedTime: [{ required: true, message: '请选择预计使用时间', trigger: 'change' }],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }]
}

const stockInfo = computed(() => {
  return selectedMaterial.value.stock || 0
})

const handleMaterialChange = (id) => {
  const material = materialOptions.value.find(item => item.id === id)
  if (material) {
    selectedMaterial.value = material
    form.quantity = 1
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (form.quantity > selectedMaterial.value.stock) {
        ElMessage.warning('申请数量不能超过当前库存')
        return
      }
      
      submitting.value = true
      
      // 模拟提交
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('申请提交成功，请等待审核')
        handleReset()
      }, 1000)
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
  selectedMaterial.value = {
    specification: '',
    unit: '',
    stock: 0
  }
}
</script>

<style scoped>
.apply-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.tips-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>

