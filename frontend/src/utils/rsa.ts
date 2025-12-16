import * as forge from 'node-forge'

/**
 * 使用RSA公钥加密明文数据
 * @param publicKeyPem PEM格式的RSA公钥
 * @param plainText 要加密的明文
 * @returns Base64编码的密文
 */
export const rsaEncrypt = (publicKeyPem: string, plainText: string): string => {
  try {
    // 解析PEM格式的公钥
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)

    // 手动将字符串转换为UTF-8字节数组（修复中文字符问题）
    const utf8Bytes = forge.util.encodeUtf8(plainText)

    // 加密字节数组
    const encrypted = publicKey.encrypt(utf8Bytes, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    })

    // 返回Base64编码的密文
    return forge.util.encode64(encrypted)
  } catch (error) {
    console.error('RSA encryption failed:', error)
    throw new Error('RSA加密失败')
  }
}
