#!/bin/bash

echo "启动 AES 后端服务 (端口 9091，使用 air 热重载)..."
echo ""

# 获取air的完整路径
AIR_PATH="$(go env GOPATH)/bin/air"

# 检查air是否已安装
if [ ! -f "$AIR_PATH" ]; then
    echo "正在安装 air..."
    go install github.com/air-verse/air@latest
    echo ""
fi

# 检查.air.toml配置文件是否存在
if [ ! -f ".air.toml" ]; then
    echo "错误：.air.toml 配置文件不存在"
    exit 1
fi

echo "启动 air 热重载服务..."
echo "服务器将在端口 9091 上运行"
echo "修改代码后会自动重新编译和重启"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动air
"$AIR_PATH"
