@echo off
chcp 65001 >nul
echo ========================================
echo   工厂仓库管理系统 - 自动启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否安装
echo [1/4] 检查 Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js
    echo.
    echo 请先安装 Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 安装完成后重启电脑
    echo 4. 重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
node -v
echo.

REM 检查是否已安装依赖
echo [2/4] 检查依赖...
if not exist "node_modules" (
    echo ⏳ 首次运行，正在安装依赖...
    echo 这可能需要 2-5 分钟，请耐心等待...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 依赖安装失败！
        echo.
        echo 可能的解决方法：
        echo 1. 检查网络连接
        echo 2. 使用国内镜像：npm config set registry https://registry.npmmirror.com
        echo 3. 重新运行此脚本
        echo.
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)
echo.

REM 启动后端服务
echo [3/4] 启动后端服务...
start "仓库系统-后端服务" cmd /k "echo 后端服务启动中... && npm run server"
timeout /t 3 /nobreak >nul
echo ✅ 后端服务已启动（端口 3000）
echo.

REM 启动前端服务
echo [4/4] 启动前端服务...
start "仓库系统-前端服务" cmd /k "echo 前端服务启动中... && timeout /t 2 /nobreak >nul && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ 前端服务已启动（端口 5173）
echo.

echo ========================================
echo   🎉 系统启动成功！
echo ========================================
echo.
echo 📱 访问地址：http://localhost:5173/
echo.
echo 👥 测试账号：
echo    老板：boss / 123456
echo    管理员：admin / 123456
echo    工程人员：engineer / 123456
echo.
echo ⚠️  注意：
echo    - 不要关闭弹出的两个命令行窗口
echo    - 关闭窗口会停止服务
echo    - 如需停止，直接关闭窗口即可
echo.
echo 🌐 正在自动打开浏览器...
timeout /t 3 /nobreak >nul
start http://localhost:5173/
echo.
echo ========================================
pause

