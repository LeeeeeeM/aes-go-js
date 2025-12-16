import { useState, useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import { rsaEncrypt } from '../utils/rsa'
import '../App.css'

function Rsa() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [encryptedData, setEncryptedData] = useState('')
  const [backendResponse, setBackendResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [loadingKey, setLoadingKey] = useState(true)
  const hasFetchedKey = useRef(false)

  // 初始化时获取RSA公钥
  useEffect(() => {
    // 防止React严格模式下的重复调用
    if (hasFetchedKey.current) {
      return
    }

    const fetchPublicKey = async () => {
      try {
        setLoadingKey(true)
        hasFetchedKey.current = true
        const response = await apiService.getRSAPublicKey()
        setPublicKey(response.publicKey)
        toast.success('RSA公钥获取成功！')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取RSA公钥失败'
        toast.error(errorMessage)
        console.error(err)
        hasFetchedKey.current = false // 失败时重置标志
      } finally {
        setLoadingKey(false)
      }
    }

    fetchPublicKey()
  }, [])

  // 处理RSA加密解密流程
  const handleProcess = async () => {
    try {
      if (!inputText.trim()) {
        toast.error('请输入要处理的文本')
        return
      }

      if (!publicKey) {
        toast.error('RSA公钥未加载，请刷新页面')
        return
      }

      setLoading(true)
      setResult('')
      setEncryptedData('')
      setBackendResponse('')

      // 1. 前端用RSA公钥加密内容
      const encryptedDataStr = rsaEncrypt(publicKey, inputText)
      setEncryptedData(encryptedDataStr)

      // 2. 发送RSA加密内容给后端
      const response = await apiService.processRSA(encryptedDataStr)
      setBackendResponse(response.decryptedData)

      // 3. 显示后端返回的解密结果
      setResult(response.decryptedData)
      toast.success('RSA加密解密测试完成！')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '处理失败'
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 清除所有数据
  const handleClear = () => {
    setInputText('')
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

      {/* 导航 */}
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
          🏠 主页
        </Link>
        <span style={{ color: '#666' }}>| 当前: RSA 页面</span>
      </nav>

      <h1>🔐 RSA 加密接口测试</h1>
      <p className="description">
        测试完整的RSA加密解密流程：前端RSA加密 → 后端RSA处理 → 前端RSA解密
      </p>

      {/* RSA公钥区域 - 最上方 */}
      <div className="section key-top-section">
        <h2>🔐 RSA 公钥</h2>

        {/* RSA公钥显示 */}
        <div className="section">
          {loadingKey ? (
            <p>正在获取RSA公钥...</p>
          ) : (
            <textarea
              value={publicKey}
              readOnly
              rows={8}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace', background: '#f8f9fa', fontSize: '12px' }}
              placeholder="RSA公钥将显示在这里..."
            />
          )}
        </div>
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
          <li>后端启动时生成RSA密钥对并提供公钥</li>
          <li>前端获取RSA公钥用于加密</li>
          <li>输入明文内容</li>
          <li>前端用RSA公钥加密内容</li>
          <li>发送加密内容给后端</li>
          <li>后端用RSA私钥解密，然后重新加密返回</li>
          <li>前端验证解密结果的正确性</li>
        </ol>
        <p><strong>注意：</strong>确保后端服务在 http://localhost:9091 运行</p>
      </div>
    </div>
  )
}

export default Rsa
