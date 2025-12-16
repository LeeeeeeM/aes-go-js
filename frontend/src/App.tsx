import { useState } from 'react'
import { AESCrypto } from './utils/aes'
import { apiService } from './services/api'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [key, setKey] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 处理完整的加密解密流程
  const handleProcess = async () => {
    try {
      if (!inputText.trim()) {
        setError('请输入要处理的文本')
        return
      }
      if (!key.trim()) {
        setError('请输入密钥')
        return
      }

      setLoading(true)
      setError('')
      setResult('')

      // 1. 前端用密钥加密内容
      const aesInstance = new AESCrypto(key)
      const { cipherB64, ivB64 } = aesInstance.encrypt(inputText)

      // 2. 发送加密内容和密钥给后端
      const response = await apiService.process(cipherB64, ivB64, key)

      // 3. 从返回的数据中解析出cipherB64和ivB64
      const [processedCipherB64, processedIVB64] = response.processedData.split('|')

      // 4. 前端用密钥解密后端返回的内容
      const decryptedResult = aesInstance.decrypt(processedCipherB64, processedIVB64)

      setResult(decryptedResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败')
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
    setError('')
  }

  return (
    <div className="app">
      <h1>AES 加解密接口测试</h1>
      <p className="description">
        测试完整的AES加密解密流程：前端加密 → 后端处理 → 前端解密
      </p>

      {error && <div className="error">{error}</div>}

      <div className="section">
        <h2>输入内容</h2>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="请输入要处理的文本内容..."
          rows={3}
        />
      </div>

      <div className="section">
        <h2>密钥</h2>
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

      <div className="section">
        <button onClick={handleProcess} disabled={loading} className="process-btn">
          {loading ? '处理中...' : '发送测试'}
        </button>
        <button onClick={handleClear} className="clear-btn">
          清除
        </button>
      </div>

      {result && (
        <div className="section">
          <h2>处理结果</h2>
          <div className="result">
            <h3>最终解密结果:</h3>
            <textarea value={result} readOnly rows={3} />
          </div>
        </div>
      )}

      <div className="info">
        <h3>测试流程:</h3>
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
