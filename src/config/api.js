
import axiosInstance from './axiosConfig';


// Export API methods
export const flashcardAPI = {
    getAllFlashcards: () => {
        return axiosInstance.get('/flashcards');
    },

    getFlashcardDetails: (id) => {
        return axiosInstance.get(`/flashcards/${id}/details`);
    },

    // Tạo flashcard mới
    createFlashcard: (data) => {
        return axiosInstance.post('/flashcards', data);
    },

    // Cập nhật flashcard
    updateFlashcard: (flashcardId, data) => {
        return axiosInstance.put(`/flashcards/${flashcardId}`, data);
    },

    // Xóa flashcard
    deleteFlashcard: (flashcardId) => {
        return axiosInstance.delete(`/flashcards/${flashcardId}`);
    },

    // Thêm từ vào flashcard
    addWordToFlashcard: (flashcardId, wordData) => {
        return axiosInstance.post(`/flashcards/${flashcardId}/words`, wordData);
    },
    updateWord: (flashcardId,wordId, wordData) => {
        return axiosInstance.put(
            `/flashcards/${flashcardId}/words/${wordId}`,
            wordData
        );
    },

    deleteWord: (flashcardId, wordId) => {
        return axiosInstance.delete(
            `/flashcards/${flashcardId}/words/${wordId}`
        );
    },
    startLearning: (flashcardId) => {

        return axiosInstance.post(`/flashcards/learn/${flashcardId}/start`);
    },

    markViewed: (flashcardId, data) => {
        return axiosInstance.put(`/flashcards/learn/${flashcardId}/mark-viewed`, data);
    },

    getLearnHistory: () => {
        return axiosInstance.get('/flashcards/learn');
    },

    resetProgress: (id) => axiosInstance.post(`/flashcards/learn/${id}/reset`),

    reportFlashcard: (flashcardId, data) => {
        return axiosInstance.post(
            `/flashcard-reports/${flashcardId}`,
            data
        );
    },
};
export const flashcardReportAPI = {
    getPendingReports: () => axiosInstance.get('/flashcard-reports/pending'),
    updateReportStatus: (reportId, status) => axiosInstance.put(`/flashcard-reports/${reportId}/status`, { status })
};
// Thêm vào config/api.js của bạn
export const flashcardReviewAPI = {
    // Admin lấy danh sách các Flashcard đang bị Supporter gắn cờ chờ duyệt
    getPendingReviews: () => {
        return axiosInstance.get('/flashcard-reviews/pending');
    },

    submitDecision: (reviewRequestId, status, adminComment) => {
        return axiosInstance.put(`/flashcard-reviews/${reviewRequestId}/decision`, {
            status,
            adminComment
        });
    }
};
