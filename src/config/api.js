import axios from 'axios';

// Lấy base URL từ .env file
// Nếu dùng proxy trong package.json, chỉ cần '/api'
// Nếu không dùng proxy, cần full URL 'http://localhost:3001/api'
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - Thêm token vào header nếu có
apiClient.interceptors.request.use(
    (config) => {
        // Nếu có token authentication, thêm vào header
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi chung
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý lỗi chung
        if (error.response) {
            // Server trả về response với status code lỗi
            switch (error.response.status) {
                case 401:
                    // Unauthorized - có thể redirect đến login
                    console.error('Unauthorized access');
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 404:
                    // Not found
                    console.error('Resource not found');
                    break;
                case 500:
                    // Server error
                    console.error('Server error');
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            console.error('No response from server');
        } else {
            // Lỗi khi setup request
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

// Export API methods
export const flashcardAPI = {
    // Lấy tất cả flashcards
    getAllFlashcards: () => {
        return apiClient.get('/flashcards');
    },

    // Lấy chi tiết flashcard theo ID
    getFlashcardDetails: (flashcardId) => {
        return apiClient.get(`/flashcards/${flashcardId}/details`);
    },

    // Tạo flashcard mới
    createFlashcard: (data) => {
        return apiClient.post('/flashcards', data);
    },

    // Cập nhật flashcard
    updateFlashcard: (flashcardId, data) => {
        return apiClient.put(`/flashcards/${flashcardId}`, data);
    },

    // Xóa flashcard
    deleteFlashcard: (flashcardId) => {
        return apiClient.delete(`/flashcards/${flashcardId}`);
    },

    // Thêm từ vào flashcard
    addWordToFlashcard: (flashcardId, wordData) => {
        return apiClient.post(`/flashcards/${flashcardId}/words`, wordData);
    },

    // Cập nhật từ trong flashcard
    updateWord: (flashcardId, wordId, wordData) => {
        return apiClient.put(`/flashcards/${flashcardId}/words/${wordId}`, wordData);
    },

    // Xóa từ khỏi flashcard
    deleteWord: (flashcardId, wordId) => {
        return apiClient.delete(`/flashcards/${flashcardId}/words/${wordId}`);
    },

    // Lấy chi tiết một từ
    getWordById: (flashcardId, wordId) => {
        return apiClient.get(`/flashcards/${flashcardId}/words/${wordId}`);
    }
};

export default apiClient;
