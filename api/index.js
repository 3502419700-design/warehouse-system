// Vercel Serverless Function
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()

app.use(cors())
app.use(bodyParser.json())

// 模拟数据库
let materials = [
  { id: 1, name: '钢材', category: '原材料', spec: 'Q235', unit: '吨', stock: 150, minStock: 50, maxStock: 500, location: 'A区-01', price: 4500, status: 'normal' },
  { id: 2, name: '水泥', category: '原材料', spec: 'P.O 42.5', unit: '吨', stock: 80, minStock: 30, maxStock: 200, location: 'B区-03', price: 450, status: 'normal' },
  { id: 3, name: '螺栓', category: '配件', spec: 'M12×50', unit: '个', stock: 5000, minStock: 1000, maxStock: 10000, location: 'C区-15', price: 0.5, status: 'normal' }
]

let users = [
  { id: 1, username: 'boss', password: '123456', role: 'boss', name: '张老板', phone: '13800138000', email: 'boss@factory.com', status: 'active' },
  { id: 2, username: 'admin', password: '123456', role: 'admin', name: '李管理', phone: '13800138001', email: 'admin@factory.com', status: 'active' },
  { id: 3, username: 'engineer', password: '123456', role: 'engineer', name: '王工程', phone: '13800138002', email: 'engineer@factory.com', status: 'active' }
]

let applications = [
  { id: 1, materialId: 1, materialName: '钢材', quantity: 10, unit: '吨', applicant: '王工程', department: '生产部', reason: '生产线扩建', status: 'pending', applyTime: '2024-01-15 10:30:00', approver: '', approveTime: '' },
  { id: 2, materialId: 2, materialName: '水泥', quantity: 5, unit: '吨', applicant: '王工程', department: '生产部', reason: '车间地面修复', status: 'approved', applyTime: '2024-01-14 14:20:00', approver: '李管理', approveTime: '2024-01-14 15:00:00' }
]

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-token-' + Date.now(),
        username: user.username,
        role: user.role,
        userId: user.id
      }
    })
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' })
  }
})

// 登出
app.post('/api/logout', (req, res) => {
  res.json({ code: 200, message: '登出成功' })
})

// 获取物资列表
app.get('/api/materials', (req, res) => {
  res.json({ code: 200, data: materials })
})

// 添加物资
app.post('/api/materials', (req, res) => {
  const newMaterial = { ...req.body, id: materials.length + 1, status: 'normal' }
  materials.push(newMaterial)
  res.json({ code: 200, message: '添加成功', data: newMaterial })
})

// 更新物资
app.put('/api/materials/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = materials.findIndex(m => m.id === id)
  if (index !== -1) {
    materials[index] = { ...materials[index], ...req.body }
    res.json({ code: 200, message: '更新成功', data: materials[index] })
  } else {
    res.status(404).json({ code: 404, message: '物资不存在' })
  }
})

// 删除物资
app.delete('/api/materials/:id', (req, res) => {
  const id = parseInt(req.params.id)
  materials = materials.filter(m => m.id !== id)
  res.json({ code: 200, message: '删除成功' })
})

// 获取库存列表
app.get('/api/inventory', (req, res) => {
  res.json({ code: 200, data: materials })
})

// 获取申请列表
app.get('/api/applications', (req, res) => {
  res.json({ code: 200, data: applications })
})

// 提交申请
app.post('/api/applications', (req, res) => {
  const newApp = {
    ...req.body,
    id: applications.length + 1,
    status: 'pending',
    applyTime: new Date().toLocaleString('zh-CN'),
    approver: '',
    approveTime: ''
  }
  applications.push(newApp)
  res.json({ code: 200, message: '申请提交成功', data: newApp })
})

// 审核申请
app.put('/api/applications/:id/approve', (req, res) => {
  const id = parseInt(req.params.id)
  const { status, approver } = req.body
  const index = applications.findIndex(a => a.id === id)
  
  if (index !== -1) {
    applications[index].status = status
    applications[index].approver = approver
    applications[index].approveTime = new Date().toLocaleString('zh-CN')
    res.json({ code: 200, message: '审核成功', data: applications[index] })
  } else {
    res.status(404).json({ code: 404, message: '申请不存在' })
  }
})

// 获取用户列表
app.get('/api/users', (req, res) => {
  res.json({ code: 200, data: users.map(u => ({ ...u, password: undefined })) })
})

// 添加用户
app.post('/api/users', (req, res) => {
  const newUser = { ...req.body, id: users.length + 1, status: 'active' }
  users.push(newUser)
  res.json({ code: 200, message: '添加成功', data: { ...newUser, password: undefined } })
})

// 更新用户
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = users.findIndex(u => u.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body }
    res.json({ code: 200, message: '更新成功', data: { ...users[index], password: undefined } })
  } else {
    res.status(404).json({ code: 404, message: '用户不存在' })
  }
})

// 删除用户
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  users = users.filter(u => u.id !== id)
  res.json({ code: 200, message: '删除成功' })
})

// 获取统计报表
app.get('/api/reports/statistics', (req, res) => {
  res.json({
    code: 200,
    data: {
      totalMaterials: materials.length,
      totalValue: materials.reduce((sum, m) => sum + m.stock * m.price, 0),
      lowStockCount: materials.filter(m => m.stock < m.minStock).length,
      pendingApplications: applications.filter(a => a.status === 'pending').length
    }
  })
})

// 获取出入库记录
app.get('/api/reports/records', (req, res) => {
  const records = [
    { id: 1, type: 'inbound', materialName: '钢材', quantity: 50, unit: '吨', operator: '李管理', time: '2024-01-15 09:00:00', remark: '采购入库' },
    { id: 2, type: 'outbound', materialName: '水泥', quantity: 5, unit: '吨', operator: '王工程', time: '2024-01-14 15:30:00', remark: '生产领用' }
  ]
  res.json({ code: 200, data: records })
})

// 入库
app.post('/api/inbound', (req, res) => {
  const { materialId, quantity } = req.body
  const material = materials.find(m => m.id === materialId)
  if (material) {
    material.stock += quantity
    res.json({ code: 200, message: '入库成功' })
  } else {
    res.status(404).json({ code: 404, message: '物资不存在' })
  }
})

// 出库
app.post('/api/outbound', (req, res) => {
  const { materialId, quantity } = req.body
  const material = materials.find(m => m.id === materialId)
  if (material) {
    if (material.stock >= quantity) {
      material.stock -= quantity
      res.json({ code: 200, message: '出库成功' })
    } else {
      res.status(400).json({ code: 400, message: '库存不足' })
    }
  } else {
    res.status(404).json({ code: 404, message: '物资不存在' })
  }
})

// Vercel 需要导出 app
export default app

