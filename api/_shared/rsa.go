package shared

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
)

// RSA 密钥对
var rsaPrivateKey *rsa.PrivateKey
var rsaPublicKey string

// 初始化RSA密钥对
func init() {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic("Failed to generate RSA key pair: " + err.Error())
	}
	rsaPrivateKey = privateKey

	// 导出公钥为PEM格式
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		panic("Failed to marshal public key: " + err.Error())
	}
	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicKeyBytes,
	})
	rsaPublicKey = string(publicKeyPEM)
}

// GetRSAPublicKey 获取RSA公钥
func GetRSAPublicKey() string {
	return rsaPublicKey
}

// GetRSAPrivateKey 获取RSA私钥
func GetRSAPrivateKey() *rsa.PrivateKey {
	return rsaPrivateKey
}

// ErrorResponse 错误响应结构体
type ErrorResponse struct {
	Error string `json:"error"`
}
