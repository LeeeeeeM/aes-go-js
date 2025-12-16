package handler

import (
	"crypto"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	shared "github.com/LeeeeeeM/aes-go-js/api/_shared"
)

type RSAProcessRequest struct {
	EncryptedData string `json:"encryptedData"`
}

// RSADecrypt 使用RSA私钥解密
func RSADecrypt(privateKey *rsa.PrivateKey, encryptedData string) (string, error) {
	// 解码Base64密文
	encryptedBytes, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", fmt.Errorf("base64 decode failed: %v", err)
	}

	// 使用RSA私钥解密
	decryptedBytes, err := privateKey.Decrypt(nil, encryptedBytes, &rsa.OAEPOptions{
		Hash: crypto.SHA256,
	})
	if err != nil {
		return "", fmt.Errorf("RSA decryption failed: %v", err)
	}

	// 将解密后的字节数组作为UTF-8字符串返回
	return string(decryptedBytes), nil
}

func RSAProcessHandler(w http.ResponseWriter, r *http.Request) {
	// 设置CORS头
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RSAProcessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("JSON decode error: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(shared.ErrorResponse{Error: "Invalid JSON"})
		return
	}

	if req.EncryptedData == "" {
		log.Printf("Empty encrypted data provided")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(shared.ErrorResponse{Error: "Encrypted data is required"})
		return
	}

	// 使用RSA解密函数
	decryptedData, err := RSADecrypt(shared.GetRSAPrivateKey(), req.EncryptedData)
	if err != nil {
		log.Printf("RSA decryption failed: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(shared.ErrorResponse{Error: "RSA decryption failed: " + err.Error()})
		return
	}

	log.Printf("RSA decryption successful! Original data: '%s'", decryptedData)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"decryptedData": decryptedData,
	})
}
