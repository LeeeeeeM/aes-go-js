import axios from 'axios';

const API_BASE_URL = '/api';

export interface ProcessRequest {
  encryptedData: string; // cipherB64 + ivB64 组合
  key: string;
}

export interface ProcessResponse {
  processedData: string; // 重新加密后的完整数据
}

export interface RSAProcessRequest {
  encryptedData: string; // RSA加密后的Base64数据
}

export interface RSAProcessResponse {
  decryptedData: string; // 后端解密后的明文数据
}

export interface ErrorResponse {
  error: string;
}

export interface PublicKeyResponse {
  publicKey: string;
}

class ApiService {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async process(encryptedData: string, key: string): Promise<ProcessResponse> {
    try {
      const response = await this.axiosInstance.post<ProcessResponse>('/process', {
        encryptedData,
        key,
      } as ProcessRequest);

      return response.data;
    } catch (error) {
      console.error('API process error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to process text');
    }
  }

  async getRSAPublicKey(): Promise<PublicKeyResponse> {
    try {
      const response = await this.axiosInstance.get<PublicKeyResponse>('/rsa/public-key');
      return response.data;
    } catch (error) {
      console.error('API get RSA public key error:', error);
      throw new Error('Failed to get RSA public key');
    }
  }

  async processRSA(encryptedData: string): Promise<RSAProcessResponse> {
    try {
      const response = await this.axiosInstance.post<RSAProcessResponse>('/rsa/process', {
        encryptedData,
      } as RSAProcessRequest);

      return response.data;
    } catch (error) {
      console.error('API RSA process error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to process RSA data');
    }
  }
}

export const apiService = new ApiService();
