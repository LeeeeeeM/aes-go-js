import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { AESCrypto } from './utils/aes'
import { apiService } from './services/api'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [key, setKey] = useState('')
  const [result, setResult] = useState('')
  const [encryptedData, setEncryptedData] = useState('')
  const [backendResponse, setBackendResponse] = useState('')
  const [loading, setLoading] = useState(false)

  // 处理完整的加密解密流程
  const handleProcess = async () => {
    try {
      if (!inputText.trim()) {
        toast.error('请输入要处理的文本')
        return
      }
      if (!key.trim()) {
        toast.error('请输入密钥')
        return
      }

      setLoading(true)
      setResult('')
      setEncryptedData('')
      setBackendResponse('')

      // 1. 前端用密钥加密内容
      const aesInstance = new AESCrypto(key)
      const encryptedDataStr = aesInstance.packEncryptedData(inputText)
      setEncryptedData(encryptedDataStr)

      // 2. 发送加密内容和密钥给后端
      const response = await apiService.process(encryptedDataStr, key)
      setBackendResponse(response.processedData)

      // 4. 前端用密钥解密后端返回的内容
      const decryptedResult = aesInstance.unpackEncryptedData(response.processedData)

      setResult(decryptedResult)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '处理失败'
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 生成随机密钥
  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setKey(result);
  }

  // 清除所有数据
  const handleClear = () => {
    setInputText('')
    setKey('')
    setResult('')
    setEncryptedData('')
    setBackendResponse('')
  }

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ff4757',
            color: '#fff',
          },
        }}
      />
      <h1>AES 加解密接口测试</h1>
      <p className="description">
        测试完整的AES加密解密流程：前端加密 → 后端处理 → 前端解密
      </p>

      {/* 密钥区域 - 最上方 */}
      <div className="section key-top-section">
        <h2>🔑 密钥设置</h2>
        <div className="key-section">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="请输入AES密钥..."
            className="key-input"
          />
          <button onClick={generateRandomKey} className="generate-key-btn">
            生成随机密钥
          </button>
        </div>
        <small className="hint">
          密钥长度建议32个字符（256位），不够时会自动填充
        </small>
      </div>

      {/* 左右分布的主要内容区域 */}
      <div className="main-content">
        {/* 左侧 - 输入区域 */}
        <div className="left-panel">
          <h2>📝 输入区域</h2>

          {/* 原始输入内容 */}
          <div className="section">
            <h3>原始输入内容</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入要处理的文本内容..."
              rows={4}
              className="input-textarea"
            />
          </div>

          {/* 传递给后端的内容 */}
          <div className="section">
            <h3>🔒 传递给后端的内容 (已加密)</h3>
            <textarea
              value={encryptedData}
              readOnly
              rows={4}
              className="encrypted-textarea"
              placeholder="加密后的数据将显示在这里..."
            />
          </div>
        </div>

        {/* 右侧 - 输出区域 */}
        <div className="right-panel">
          <h2>📤 输出区域</h2>

          {/* 后端返回的原始内容 */}
          <div className="section">
            <h3>📦 后端返回的原始内容 (已加密)</h3>
            <textarea
              value={backendResponse}
              readOnly
              rows={4}
              className="backend-response-textarea"
              placeholder="后端返回的加密数据将显示在这里..."
            />
          </div>

          {/* 最终解密结果 */}
          <div className="section">
            <h3>✅ 最终解密结果</h3>
            <textarea
              value={result}
              readOnly
              rows={4}
              className="result-textarea"
              placeholder="解密后的明文将显示在这里..."
            />
          </div>
        </div>
      </div>

      {/* 操作按钮区域 */}
      <div className="global-button-section">
        <button onClick={handleProcess} disabled={loading} className="process-btn">
          {loading ? '处理中...' : '🚀 发送测试'}
        </button>
        <button onClick={handleClear} className="clear-btn">
          🗑️ 清除
        </button>
      </div>

      {/* 底部信息区域 */}
      <div className="info">
        <h3>🔄 测试流程:</h3>
        <ol>
          <li>输入明文内容和密钥</li>
          <li>前端用密钥加密内容</li>
          <li>发送加密内容和密钥给后端</li>
          <li>后端用密钥解密，然后重新加密返回</li>
          <li>前端用密钥解密后端返回的内容</li>
          <li>验证整个流程的正确性</li>
        </ol>
        <p><strong>注意：</strong>确保后端服务在 http://localhost:9091 运行</p>
      </div>
    </div>
  )
}

export default App
