import axios from 'axios';

const API_BASE_URL = '/api';

export interface ProcessRequest {
  encryptedData: string; // cipherB64 + ivB64 组合
  key: string;
}

export interface ProcessResponse {
  processedData: string; // 重新加密后的完整数据
}

export interface ErrorResponse {
  error: string;
}

class ApiService {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async process(cipherB64: string, ivB64: string, key: string): Promise<ProcessResponse> {
    try {
      // 将cipherB64和ivB64组合成一个字符串，用特殊分隔符分开
      const encryptedData = cipherB64 + '|' + ivB64;
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
}

export const apiService = new ApiService();
