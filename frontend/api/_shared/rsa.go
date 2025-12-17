package shared

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"sync"
)

var (
	rsaPrivateKey *rsa.PrivateKey
	rsaPublicKey  string
	initOnce      sync.Once
	initError     error
)

// initRSAKeys 初始化RSA密钥对（从环境变量加载，一次性初始化）
func initRSAKeys() {
	// 从环境变量获取私钥
	privateKeyPEM := os.Getenv("RSA_PRIVATE_KEY")
	if privateKeyPEM == "" {
		initError = fmt.Errorf("RSA_PRIVATE_KEY environment variable is not set")
		return
	}

	// 从环境变量获取公钥
	publicKeyPEM := os.Getenv("RSA_PUBLIC_KEY")
	if publicKeyPEM == "" {
		initError = fmt.Errorf("RSA_PUBLIC_KEY environment variable is not set")
		return
	}

	// 解析私钥
	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		initError = fmt.Errorf("failed to decode private key PEM")
		return
	}

	privateKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		initError = fmt.Errorf("failed to parse private key: %v", err)
		return
	}

	rsaKey, ok := privateKey.(*rsa.PrivateKey)
	if !ok {
		initError = fmt.Errorf("private key is not RSA type")
		return
	}

	rsaPrivateKey = rsaKey
	rsaPublicKey = publicKeyPEM
}

// GetRSAPublicKey 获取RSA公钥（使用固定的环境变量密钥）
func GetRSAPublicKey() (string, error) {
	initOnce.Do(initRSAKeys)
	if initError != nil {
		return "", initError
	}
	return rsaPublicKey, nil
}

// GetRSAKeyPair 获取完整的RSA密钥对（使用固定的环境变量密钥）
func GetRSAKeyPair() (*rsa.PrivateKey, string, error) {
	initOnce.Do(initRSAKeys)
	if initError != nil {
		return nil, "", initError
	}
	return rsaPrivateKey, rsaPublicKey, nil
}

// ErrorResponse 错误响应结构体
type ErrorResponse struct {
	Error string `json:"error"`
}
