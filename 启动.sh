#!/bin/bash

echo "========================================"
echo "  工厂仓库管理系统 - 自动启动脚本"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
echo "[1/4] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js"
    echo ""
    echo "请先安装 Node.js："
    echo "1. 访问 https://nodejs.org/"
    echo "2. 下载并安装 LTS 版本"
    echo "3. 安装完成后重新运行此脚本"
    echo ""
    exit 1
fi
echo "✅ Node.js 已安装"
node -v
echo ""

# 检查是否已安装依赖
echo "[2/4] 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "⏳ 首次运行，正在安装依赖..."
    echo "这可能需要 2-5 分钟，请耐心等待..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 依赖安装失败！"
        echo ""
        echo "可能的解决方法："
        echo "1. 检查网络连接"
        echo "2. 使用国内镜像：npm config set registry https://registry.npmmirror.com"
        echo "3. 重新运行此脚本"
        echo ""
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi
echo ""

# 启动后端服务
echo "[3/4] 启动后端服务..."
npm run server &
BACKEND_PID=$!
sleep 3
echo "✅ 后端服务已启动（端口 3000，PID: $BACKEND_PID）"
echo ""

# 启动前端服务
echo "[4/4] 启动前端服务..."
npm run dev &
FRONTEND_PID=$!
sleep 5
echo "✅ 前端服务已启动（端口 5173，PID: $FRONTEND_PID）"
echo ""

echo "========================================"
echo "  🎉 系统启动成功！"
echo "========================================"
echo ""
echo "📱 访问地址：http://localhost:5173/"
echo ""
echo "👥 测试账号："
echo "   老板：boss / 123456"
echo "   管理员：admin / 123456"
echo "   工程人员：engineer / 123456"
echo ""
echo "⚠️  注意："
echo "   - 按 Ctrl+C 停止所有服务"
echo "   - 后端 PID: $BACKEND_PID"
echo "   - 前端 PID: $FRONTEND_PID"
echo ""
echo "🌐 正在自动打开浏览器..."
sleep 2

# 根据操作系统打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac
    open http://localhost:5173/
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:5173/ 2>/dev/null || echo "请手动打开浏览器访问 http://localhost:5173/"
fi

echo ""
echo "========================================"
echo "按 Ctrl+C 停止服务"
echo "========================================"

# 等待用户中断
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服务已停止'; exit 0" INT

# 保持脚本运行
wait

