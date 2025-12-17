package handler

import (
	"encoding/json"
	"net/http"

	shared "github.com/LeeeeeeM/aes-go-js/api/_shared"
)

func RSAPublicKeyHandler(w http.ResponseWriter, r *http.Request) {
	// 设置CORS头
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	publicKey, err := shared.GetRSAPublicKey()
	if err != nil {
		http.Error(w, "Failed to generate RSA key", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"publicKey": publicKey,
	})
}
