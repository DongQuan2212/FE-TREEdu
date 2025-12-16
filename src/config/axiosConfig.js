import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ nơi bạn đã lưu (theo file authUtils bạn gửi là 'accessToken')
        const token = localStorage.getItem('accessToken');

        if (token) {
            // Gắn token vào header: Authorization: Bearer eyJ...
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Interceptor xử lý response
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('userInfo');

            // Chỉ redirect nếu không phải đang ở trang login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
