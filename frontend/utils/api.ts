import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, 
});

export const chatWithAI = async (message: string) => {
  try {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  } catch (error: any) {
    console.error("API Call Failed:", error);
    throw error.response?.data || error.message;
  }
};

// 1. Gửi đi: Gắn Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // --- DEBUG: Bật F12 Console lên xem dòng này có hiện token không ---
      console.log("Interceptor đang chạy. Token lấy được là:", token); 
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Nhận về: Xử lý lỗi 401 (Token hết hạn) - PHẦN BẠN ĐANG THIẾU
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Lỗi 401: Token hết hạn hoặc không hợp lệ. Đang logout...");
      
      // Xóa sạch dấu vết
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Đá về trang login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;