#!/bin/bash

echo "启动 AES 加解密演示项目..."
echo ""

# 启动后端服务（使用air热重载）
echo "启动 Go 后端服务 (使用 air 热重载，端口 9091)..."
cd backend
./start-backend.sh &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动前端服务
echo "启动 React 前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "服务已启动："
echo "- 后端 API: http://localhost:9091 (支持热重载)"
echo "- 前端界面: http://localhost:5173"
echo ""
echo "修改后端代码后会自动重启服务"
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
