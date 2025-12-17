package shared

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
)

// 生成RSA密钥对（每次调用都重新生成，确保一致性）
func generateRSAKeyPair() (*rsa.PrivateKey, string, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, "", err
	}

	// 导出公钥为PEM格式
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		return nil, "", err
	}
	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicKeyBytes,
	})

	return privateKey, string(publicKeyPEM), nil
}

// GetRSAPublicKey 获取RSA公钥（每次调用重新生成）
func GetRSAPublicKey() (string, error) {
	_, publicKey, err := generateRSAKeyPair()
	return publicKey, err
}

// GetRSAKeyPair 获取完整的RSA密钥对（每次调用重新生成）
func GetRSAKeyPair() (*rsa.PrivateKey, string, error) {
	return generateRSAKeyPair()
}

// ErrorResponse 错误响应结构体
type ErrorResponse struct {
	Error string `json:"error"`
}
