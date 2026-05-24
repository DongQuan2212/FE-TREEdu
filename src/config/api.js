
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
    changeVisibility: (id, visibility) => {
        return axiosInstance.put(`/flashcards/${id}/visibility`, null, {
            params: { visibility } // Đẩy query param dạng ?visibility=PUBLIC lên URL
        });
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

// Thêm vào file API hiện tại của ông
export const missionAPI = {
    // 1️⃣ Lấy danh sách nhiệm vụ hôm nay
    getDailyMissions: () => {
        return axiosInstance.get('/missions/daily');
    },

    // 2️⃣ Điểm danh ngày mới
    checkIn: () => {
        return axiosInstance.post('/missions/check-in');
    },

    // 3️⃣ Nhận thưởng theo ID nhiệm vụ
    claimReward: (missionId) => {
        return axiosInstance.post(`/missions/${missionId}/claim-reward`);
    }
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
