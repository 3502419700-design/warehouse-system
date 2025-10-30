import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 模拟用户数据
const users = [
  { id: 1, username: 'boss', password: '123456', role: 'boss', realName: '李总' },
  { id: 2, username: 'admin', password: '123456', role: 'admin', realName: '张三' },
  { id: 3, username: 'engineer', password: '123456', role: 'engineer', realName: '王五' }
];

// 生成 token
function generateToken(user) {
  return `token_${user.id}_${Date.now()}`;
}

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const token = generateToken(user);
    res.json({
      code: 200,
      message: 'success',
      data: {
        token,
        username: user.username,
        role: user.role,
        userId: user.id
      }
    });
  } else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误'
    });
  }
});

// 退出登录
app.post('/api/logout', (req, res) => {
  res.json({
    code: 200,
    message: '退出成功'
  });
});

// 获取物资列表
app.get('/api/materials', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { id: 1, name: '钢材Q235', category: '钢材', specification: '6m*200mm', unit: '吨', price: 4500, minStock: 50, maxStock: 500, location: 'A区-01' },
        { id: 2, name: '水泥425', category: '水泥', specification: '50kg/袋', unit: '袋', price: 25, minStock: 500, maxStock: 5000, location: 'B区-03' },
        { id: 3, name: '电线BV2.5', category: '电线', specification: '2.5平方', unit: '米', price: 3.5, minStock: 1000, maxStock: 10000, location: 'C区-05' }
      ],
      total: 3
    }
  });
});

// 添加物资
app.post('/api/materials', (req, res) => {
  res.json({
    code: 200,
    message: '添加成功'
  });
});

// 更新物资
app.put('/api/materials/:id', (req, res) => {
  res.json({
    code: 200,
    message: '更新成功'
  });
});

// 删除物资
app.delete('/api/materials/:id', (req, res) => {
  res.json({
    code: 200,
    message: '删除成功'
  });
});

// 获取库存列表
app.get('/api/inventory', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { id: 1, materialName: '钢材Q235', category: '钢材', currentStock: 150, minStock: 50, maxStock: 500 },
        { id: 2, materialName: '水泥425', category: '水泥', currentStock: 2000, minStock: 500, maxStock: 5000 }
      ],
      total: 2
    }
  });
});

// 获取入库列表
app.get('/api/inbound', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { id: 1, orderNo: 'IN202510300001', material: '钢材Q235', quantity: 500, supplier: 'XX钢铁公司', operator: '张三', inboundTime: '2025-10-30 14:30' }
      ],
      total: 1
    }
  });
});

// 添加入库
app.post('/api/inbound', (req, res) => {
  res.json({
    code: 200,
    message: '入库成功'
  });
});

// 获取出库列表
app.get('/api/outbound', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { id: 1, orderNo: 'OUT202510300001', material: '钢材Q235', quantity: 100, type: '领用', recipient: '王五', status: '已完成', outboundTime: '2025-10-30 13:15' }
      ],
      total: 1
    }
  });
});

// 添加出库
app.post('/api/outbound', (req, res) => {
  res.json({
    code: 200,
    message: '出库成功'
  });
});

// 获取申请列表
app.get('/api/applications', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { id: 1, applyNo: 'APP202510300001', applicant: '王五', material: '钢材Q235', quantity: 100, purpose: '项目建设', applyTime: '2025-10-30 10:20', status: 'pending' }
      ],
      total: 1
    }
  });
});

// 添加申请
app.post('/api/applications', (req, res) => {
  res.json({
    code: 200,
    message: '申请提交成功'
  });
});

// 审核申请
app.post('/api/applications/:id/approve', (req, res) => {
  res.json({
    code: 200,
    message: '审核成功'
  });
});

// 获取我的申请
app.get('/api/applications/my', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { id: 1, applyNo: 'APP202510300001', material: '钢材Q235', quantity: 100, status: 'pending', applyTime: '2025-10-30 10:20' }
      ],
      total: 1
    }
  });
});

// 获取用户列表
app.get('/api/users', (req, res) => {
  res.json({
    code: 200,
    data: {
      list: users.map(u => ({
        id: u.id,
        username: u.username,
        realName: u.realName,
        role: u.role,
        phone: '13800138000',
        email: `${u.username}@example.com`,
        status: '启用',
        createTime: '2025-01-01 10:00'
      })),
      total: users.length
    }
  });
});

// 添加用户
app.post('/api/users', (req, res) => {
  res.json({
    code: 200,
    message: '添加成功'
  });
});

// 更新用户
app.put('/api/users/:id', (req, res) => {
  res.json({
    code: 200,
    message: '更新成功'
  });
});

// 删除用户
app.delete('/api/users/:id', (req, res) => {
  res.json({
    code: 200,
    message: '删除成功'
  });
});

// 获取统计数据
app.get('/api/reports/statistics', (req, res) => {
  res.json({
    code: 200,
    data: {
      totalMaterials: 156,
      totalInventory: 8520,
      totalValue: 2580000,
      lowStockCount: 12
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock 后端服务已启动，运行在 http://localhost:${PORT}`);
  console.log('可用的测试账号：');
  console.log('  老板: boss / 123456');
  console.log('  管理员: admin / 123456');
  console.log('  工程人员: engineer / 123456');
});

