import * as forge from 'node-forge';

// 真正的AES-GCM实现，使用node-forge库
export class AESCrypto {
  private key: string;

  constructor(key: string = '1234567890123456') { // 默认16字节密钥
    this.key = key;
  }

  // 设置新密钥
  setKey(key: string) {
    this.key = key;
  }

  /**
   * 真正的AES-GCM加密
   * @param {string} plainText 明文
   * @returns {object} { cipherB64: 密文+认证标签的base64, ivB64: IV的base64 }
   */
  encrypt(text: string): { cipherB64: string; ivB64: string } {
    try {
      // 确保密钥长度为16/24/32字节
      let aesKey = this.key;
      if (aesKey.length < 16) {
        aesKey = aesKey.padEnd(16, '\0');
      } else if (aesKey.length > 32) {
        aesKey = aesKey.substring(0, 32);
      } else if (aesKey.length !== 16 && aesKey.length !== 24 && aesKey.length !== 32) {
        // 如果不是标准长度，填充到32字节
        aesKey = aesKey.padEnd(32, '\0');
      }

      // 创建密钥buffer
      const key = forge.util.createBuffer(aesKey);

      // 生成12字节IV（GCM标准）
      const iv = forge.random.getBytesSync(12);

      // 创建AES-GCM加密器
      const cipher = forge.cipher.createCipher('AES-GCM', key);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(text, 'utf8'));
      cipher.finish();

      // 获取密文和认证标签
      const encrypted = cipher.output.getBytes();
      const tag = cipher.mode.tag.getBytes(); // 16字节认证标签

      // 密文 + 认证标签
      const cipherWithTag = encrypted + tag;

      return {
        cipherB64: forge.util.encode64(cipherWithTag),
        ivB64: forge.util.encode64(iv),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * 真正的AES-GCM解密
   * @param {string} cipherB64 密文+认证标签的base64
   * @param {string} ivB64 IV的base64
   * @returns {string} 明文
   */
  decrypt(cipherB64: string, ivB64: string): string {
    try {
      // 确保密钥长度为16/24/32字节
      let aesKey = this.key;
      if (aesKey.length < 16) {
        aesKey = aesKey.padEnd(16, '\0');
      } else if (aesKey.length > 32) {
        aesKey = aesKey.substring(0, 32);
      } else if (aesKey.length !== 16 && aesKey.length !== 24 && aesKey.length !== 32) {
        // 如果不是标准长度，填充到32字节
        aesKey = aesKey.padEnd(32, '\0');
      }

      // 创建密钥buffer
      const key = forge.util.createBuffer(aesKey);

      // 解码IV和密文
      const ivBytes = forge.util.decode64(ivB64);
      const cipherWithTagBytes = forge.util.decode64(cipherB64);

      // 分离密文和认证标签（最后16字节是认证标签）
      const cipherTextBytes = cipherWithTagBytes.slice(0, -16);
      const tagBytes = cipherWithTagBytes.slice(-16);

      // 创建AES-GCM解密器
      const decipher = forge.cipher.createDecipher('AES-GCM', key);
      decipher.start({ iv: forge.util.createBuffer(ivBytes), tag: forge.util.createBuffer(tagBytes) });
      decipher.update(forge.util.createBuffer(cipherTextBytes));

      // 完成解密
      const success = decipher.finish();
      if (!success) {
        throw new Error('Decryption failed - authentication tag verification failed');
      }

      // 获取明文
      const plainText = decipher.output.toString();
      if (!plainText) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      return plainText;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

}

