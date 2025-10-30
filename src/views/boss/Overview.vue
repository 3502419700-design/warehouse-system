<template>
  <div class="overview-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409EFF"><Goods /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalMaterials }}</div>
              <div class="stat-label">物资种类</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67C23A"><Box /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalInventory }}</div>
              <div class="stat-label">库存总量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#E6A23C"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.totalValue.toLocaleString() }}</div>
              <div class="stat-label">库存价值</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#F56C6C"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.lowStockCount }}</div>
              <div class="stat-label">库存预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>出入库趋势</span>
            </div>
          </template>
          <div ref="inOutChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>物资分类统计</span>
            </div>
          </template>
          <div ref="categoryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近操作记录</span>
            </div>
          </template>
          <el-table :data="recentRecords" stripe>
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="type" label="操作类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="material" label="物资名称" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="description" label="说明" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Goods, Box, Money, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { reportAPI } from '@/api'

const statistics = ref({
  totalMaterials: 156,
  totalInventory: 8520,
  totalValue: 2580000,
  lowStockCount: 12
})

const recentRecords = ref([
  { time: '2025-10-30 14:30', operator: '张三', type: '入库', material: '钢材', quantity: 500, description: '采购入库' },
  { time: '2025-10-30 13:15', operator: '李四', type: '出库', material: '水泥', quantity: 200, description: '项目领用' },
  { time: '2025-10-30 11:20', operator: '王五', type: '盘点', material: '螺丝', quantity: 1000, description: '定期盘点' },
  { time: '2025-10-30 10:05', operator: '赵六', type: '入库', material: '电线', quantity: 300, description: '采购入库' },
  { time: '2025-10-30 09:30', operator: '孙七', type: '出库', material: '油漆', quantity: 50, description: '维修领用' }
])

const inOutChartRef = ref(null)
const categoryChartRef = ref(null)

const getTypeColor = (type) => {
  const colorMap = {
    '入库': 'success',
    '出库': 'warning',
    '盘点': 'info'
  }
  return colorMap[type] || 'info'
}

const initInOutChart = () => {
  const chart = echarts.init(inOutChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['入库', '出库']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库',
        type: 'line',
        data: [320, 280, 450, 380, 420, 350, 400],
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '出库',
        type: 'line',
        data: [220, 180, 250, 280, 320, 250, 300],
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  chart.setOption(option)
  
  window.addEventListener('resize', () => chart.resize())
}

const initCategoryChart = () => {
  const chart = echarts.init(categoryChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '物资分类',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 1048, name: '钢材' },
          { value: 735, name: '水泥' },
          { value: 580, name: '电线' },
          { value: 484, name: '油漆' },
          { value: 300, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
  
  window.addEventListener('resize', () => chart.resize())
}

onMounted(() => {
  initInOutChart()
  initCategoryChart()
})
</script>

<style scoped>
.overview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.chart-row {
  margin-bottom: 0;
}
</style>

