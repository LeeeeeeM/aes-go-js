package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

// AESGCMDecryptFromJS Go 端解密（解析 JS node-forge 加密的密文）
func AESGCMDecryptFromJS(cipherB64, ivB64 string, key []byte) ([]byte, error) {
	// 1. 调整密钥长度以匹配前端逻辑
	keyBytes := make([]byte, len(key))
	copy(keyBytes, key)

	if len(keyBytes) < 16 {
		// 填充到16字节
		padding := make([]byte, 16-len(keyBytes))
		keyBytes = append(keyBytes, padding...)
	} else if len(keyBytes) > 32 {
		// 截断到32字节
		keyBytes = keyBytes[:32]
	} else if len(keyBytes) != 16 && len(keyBytes) != 24 && len(keyBytes) != 32 {
		// 填充到32字节
		padding := make([]byte, 32-len(keyBytes))
		keyBytes = append(keyBytes, padding...)
	}

	// 2. 解码 Base64
	cipherTextWithTag, err := base64.StdEncoding.DecodeString(cipherB64)
	if err != nil {
		return nil, fmt.Errorf("cipher base64 decode failed: %v", err)
	}

	iv, err := base64.StdEncoding.DecodeString(ivB64)
	if err != nil {
		return nil, fmt.Errorf("iv base64 decode failed: %v", err)
	}

	// 3. 校验调整后的密钥长度
	if len(keyBytes) != 16 && len(keyBytes) != 24 && len(keyBytes) != 32 {
		return nil, fmt.Errorf("密钥长度必须是16/24/32字节，调整后长度: %d", len(keyBytes))
	}

	// 4. 创建 AES 区块和 GCM 模式
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("GCM 创建失败: %v", err)
	}

	// 4. 校验IV长度（GCM需要12字节）
	if len(iv) != gcm.NonceSize() {
		return nil, fmt.Errorf("IV长度必须是%d字节，实际是%d字节", gcm.NonceSize(), len(iv))
	}

	// 5. 解密（GCM 自动拆分密文和标签）
	plainText, err := gcm.Open(nil, iv, cipherTextWithTag, nil)
	if err != nil {
		return nil, fmt.Errorf("解密失败：%v", err)
	}

	return plainText, nil
}

// AESGCMEncryptForJS Go 端加密（适配 JS node-forge 的 GCM 格式）
func AESGCMEncryptForJS(plainText []byte, key []byte) (string, string, error) {
	// 1. 调整密钥长度以匹配前端逻辑
	keyBytes := make([]byte, len(key))
	copy(keyBytes, key)

	if len(keyBytes) < 16 {
		// 填充到16字节
		padding := make([]byte, 16-len(keyBytes))
		keyBytes = append(keyBytes, padding...)
	} else if len(keyBytes) > 32 {
		// 截断到32字节
		keyBytes = keyBytes[:32]
	} else if len(keyBytes) != 16 && len(keyBytes) != 24 && len(keyBytes) != 32 {
		// 填充到32字节
		padding := make([]byte, 32-len(keyBytes))
		keyBytes = append(keyBytes, padding...)
	}

	// 2. 校验调整后的密钥长度
	if len(keyBytes) != 16 && len(keyBytes) != 24 && len(keyBytes) != 32 {
		return "", "", fmt.Errorf("密钥长度必须是16/24/32字节，调整后长度: %d", len(keyBytes))
	}

	// 3. 创建 AES 区块和 GCM 模式
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return "", "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", "", err
	}

	// 3. 生成 12 字节 IV（GCM标准）
	iv := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", "", err
	}

	// 4. 加密（GCM 自动生成 16 字节认证标签）
	cipherText := gcm.Seal(nil, iv, plainText, nil) // cipherText = 密文 + 标签

	// 5. 转 Base64（与 JS 格式统一）
	return base64.StdEncoding.EncodeToString(cipherText), base64.StdEncoding.EncodeToString(iv), nil
}

// HTTP请求响应结构
type ProcessRequest struct {
	EncryptedData string `json:"encryptedData"` // cipherB64|ivB64
	Key           string `json:"key"`
}

type ProcessResponse struct {
	ProcessedData string `json:"processedData"` // cipherB64|ivB64
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func main() {
	// 解析命令行参数
	var port = flag.String("port", "8080", "服务器端口")
	flag.Parse()

	// 设置CORS中间件
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next(w, r)
		}
	}

	// 处理接口：接收加密内容和密钥，解密后重新加密返回
	http.HandleFunc("/api/process", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {

		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req ProcessRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("JSON decode error: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid JSON"})
			return
		}

		// 解析加密数据
		parts := strings.Split(req.EncryptedData, "|")
		if len(parts) != 2 {
			log.Printf("Invalid encrypted data format")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid encrypted data format"})
			return
		}

		cipherB64 := parts[0]
		ivB64 := parts[1]

		log.Printf("Received request: cipherB64='%s', ivB64='%s', key='%s'",
			cipherB64, ivB64, req.Key)

		if req.Key == "" {
			log.Printf("Empty key provided")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Key is required"})
			return
		}

		if cipherB64 == "" || ivB64 == "" {
			log.Printf("Empty cipher or IV provided")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Cipher and IV are required"})
			return
		}

		// 解密接收到的加密内容
		log.Printf("Starting GCM decryption")
		decrypted, err := AESGCMDecryptFromJS(cipherB64, ivB64, []byte(req.Key))
		if err != nil {
			log.Printf("Decryption failed: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: fmt.Sprintf("Decryption failed: %v", err)})
			return
		}

		log.Printf("Decryption successful!")
		log.Printf("🔓 DECRYPTED CONTENT: '%s' (length: %d bytes)", string(decrypted), len(decrypted))

		// 重新加密解密后的内容
		reCipherB64, reIVB64, err := AESGCMEncryptForJS(decrypted, []byte(req.Key))
		if err != nil {
			log.Printf("Re-encryption failed: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Re-encryption failed"})
			return
		}

		log.Printf("Re-encryption successful")

		// 组合成一个字符串返回
		processedData := reCipherB64 + "|" + reIVB64

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ProcessResponse{
			ProcessedData: processedData,
		})
	}))

	fmt.Printf("Server starting on :%s...\n", *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
