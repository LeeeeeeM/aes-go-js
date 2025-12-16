# 🔐 Go-JS 加密解密演示项目

一个完整的加密解密演示项目，支持 AES-GCM 和 RSA 加密算法的前后端交互测试。

## ✨ 功能特性

- 🔄 **完整加密流程测试**：前端加密 → 后端处理 → 前端解密验证
- 🔑 **双重加密支持**：AES-GCM 和 RSA 加密算法
- 🎯 **前后端兼容**：Go 后端与 JavaScript 前端的完美配合
- 🌐 **兼容性友好**：不依赖 `window.crypto.subtle`，可在任何HTTP环境下工作
- 🚀 **开发友好**：支持热重载，快速迭代开发
- 📱 **现代化UI**：响应式设计，优秀的用户体验
- 🛡️ **安全演示**：展示加密算法的实际应用

## 🏗️ 技术栈

### 前端 (React + TypeScript)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **路由**: React Router DOM
- **加密库**:
  - `node-forge`: RSA 加密 (兼容性友好)
  - 自定义 AES-GCM 实现 (适配 Go 后端，不依赖浏览器crypto API)
- **HTTP 客户端**: Axios
- **UI 组件**: 原生 CSS + React Hot Toast

### 后端 (Go)
- **语言**: Go 1.24.3
- **加密库**: Go 标准库 `crypto/*`
- **Web 框架**: 标准库 `net/http`
- **跨域支持**: CORS 中间件
- **开发工具**: Air (热重载)

## 📁 项目结构

```
├── backend/                    # Go 后端服务
│   ├── main.go                # 主服务文件
│   ├── go.mod                 # Go 模块定义
│   ├── start-backend.sh       # 后端启动脚本
│   └── tmp/                   # 临时文件目录
├── frontend/                   # React 前端应用
│   ├── src/
│   │   ├── App.tsx            # 应用入口
│   │   ├── pages/             # 页面组件
│   │   │   ├── Home.tsx       # AES 测试页面
│   │   │   └── Rsa.tsx        # RSA 测试页面
│   │   ├── utils/             # 工具函数
│   │   │   ├── aes.ts         # AES 加密工具
│   │   │   └── rsa.ts         # RSA 加密工具
│   │   ├── services/          # API 服务
│   │   │   └── api.ts         # HTTP API 客户端
│   │   └── assets/            # 静态资源
│   ├── package.json           # 前端依赖配置
│   └── vite.config.ts         # Vite 配置
├── start.sh                   # 一键启动脚本
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 方式一：一键启动 (推荐)

```bash
# 克隆项目后，直接运行
./start.sh
```

脚本会自动：
1. 启动 Go 后端服务 (端口 9091，支持热重载)
2. 启动 React 前端 (端口 5173)
3. 提供友好的停止机制

### 方式二：手动启动

#### 1. 启动后端服务

```bash
cd backend

# 方式1：使用 air 热重载（推荐）
./start-backend.sh

# 方式2：直接运行
go run main.go -port 9091
```

#### 2. 启动前端项目

```bash
cd frontend
npm install
npm run dev
```

#### 3. 访问应用

打开浏览器访问：
- **前端界面**: http://localhost:5173
- **后端 API**: http://localhost:9091

## 📖 使用指南

### 🔑 AES-GCM 加密测试

访问主页进行 AES-GCM 加密测试：

1. **设置密钥**
   - 手动输入 32 字符密钥
   - 或点击"生成随机密钥"按钮

2. **输入测试内容**
   - 在左侧输入框输入明文

3. **执行测试**
   - 点击"发送测试"按钮
   - 观察完整的加密解密流程

4. **验证结果**
   - 最终解密结果应与原始输入一致

**测试流程**:
```
明文 → 前端AES加密 → 后端AES解密 → 后端AES重新加密 → 前端AES解密 → 验证
```

### 🔐 RSA 加密测试

访问 `/rsa` 页面进行 RSA 加密测试：

1. **自动获取公钥**
   - 页面加载时自动获取后端生成的 RSA 公钥

2. **输入测试内容**
   - 输入要加密的明文

3. **执行测试**
   - 前端使用 RSA 公钥加密
   - 后端使用 RSA 私钥解密

**测试流程**:
```
明文 → 前端RSA公钥加密 → 后端RSA私钥解密 → 返回明文 → 前端验证
```

## 🔧 API 接口

### AES-GCM 接口

#### `POST /api/process`
完整的 AES 加密解密测试接口

**请求格式**:
```json
{
  "encryptedData": "cipherB64|ivB64",
  "key": "AES密钥字符串"
}
```

**响应格式**:
```json
{
  "processedData": "reCipherB64|reIvB64"
}
```

### RSA 接口

#### `GET /api/rsa/public-key`
获取 RSA 公钥

**响应格式**:
```json
{
  "publicKey": "PEM格式的RSA公钥"
}
```

#### `POST /api/rsa/process`
RSA 解密处理接口

**请求格式**:
```json
{
  "encryptedData": "Base64编码的RSA密文"
}
```

**响应格式**:
```json
{
  "decryptedData": "解密后的明文"
}
```

## 🔒 加密算法配置

### AES-GCM 配置
- **模式**: GCM (Galois/Counter Mode)
- **密钥长度**: 16/24/32 字节 (自动填充)
- **IV长度**: 12 字节 (GCM 标准)
- **认证标签**: 16 字节 (自动生成)

### RSA 配置
- **密钥长度**: 2048 位
- **填充模式**: OAEP
- **哈希算法**: SHA-256

## 🛡️ 安全注意事项

⚠️ **重要提醒**: 此项目仅用于学习和演示加密算法！

### 生产环境建议

1. **密钥管理**
   - 使用专业的密钥管理系统 (HSM/KMS)
   - 实施密钥轮换策略
   - 避免硬编码密钥

2. **传输安全**
   - 强制使用 HTTPS
   - 实施 TLS 1.3
   - 配置安全的密码套件

3. **访问控制**
   - 添加身份验证和授权
   - 实施速率限制
   - 使用 API 密钥或 OAuth

4. **安全审计**
   - 记录敏感操作日志
   - 定期安全评估
   - 监控异常活动

5. **数据保护**
   - 加密敏感数据存储
   - 实施数据最小化原则
   - 遵守隐私法规 (GDPR 等)

### 🔧 兼容性优势

**为什么选择第三方加密库而非浏览器原生API？**

1. **环境限制**
   - `window.crypto.subtle` 仅在 HTTPS 或 localhost 下可用
   - 在普通的 HTTP 域名环境下无法使用
   - 开发和测试环境受限

2. **跨平台兼容**
   - 本项目使用 `node-forge` 和自定义 AES 实现
   - 可在任何 HTTP/HTTPS 环境下正常工作
   - 不依赖浏览器安全策略限制

3. **开发便利性**
   - 无需配置 HTTPS 证书
   - 可在任何域名下部署和测试
   - 适合学习和演示场景

**注意**: 生产环境仍建议使用 HTTPS + `crypto.subtle` 的原生方案以获得最佳安全性。

## 🐛 故障排除

### 常见问题

**Q: 前端无法连接后端**
A: 确保后端在端口 9091 运行，检查防火墙设置

**Q: RSA 公钥获取失败**
A: 检查后端日志，后端启动时会生成 RSA 密钥对

**Q: AES 解密失败**
A: 检查密钥长度和格式，确保前后端算法一致

### 开发调试

```bash
# 查看后端日志
cd backend
tail -f tmp/main.log

# 前端开发服务器日志
cd frontend
npm run dev
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目仅用于学习和研究目的，请勿用于生产环境。

## 🙏 致谢

- [Go 官方文档](https://golang.org/doc/)
- [Node.js Forge](https://github.com/digitalbazaar/forge)
- [React 官方文档](https://react.dev/)
- [Vite 构建工具](https://vitejs.dev/)
