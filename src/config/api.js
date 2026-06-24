
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

    searchFlashcards: (title) => {
    return axiosInstance.get(`/flashcards/search/${title}`);
    },

    // Thêm từ vào flashcard
    addWordToFlashcard: (flashcardId, wordData) => {
        return axiosInstance.post(`/flashcards/${flashcardId}/words`, wordData);
    },

    submitAnswer: (flashcardId, data) => {
        return axiosInstance.post(`/flashcards/learn/${flashcardId}/submit-answer`, data);
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
// Thêm vào config/api.js
export const dictationAPI = {


    getById: (id) => {
        return axiosInstance.get(`/dictation/${id}`);
    },
    // 1. Lấy tất cả bài nghe (Dành cho Admin/Supporter)
    getAllForAdmin: () => {
        return axiosInstance.get('/dictation/all');
    },

    // 2. Member lấy danh sách bài đã PUBLISHED (Dành cho Học viên)
    getAllForMember: () => {
        return axiosInstance.get('/dictation');
    },

    generateByAI: (formData) => {
        return axiosInstance.post('/dictation/generate-by-ai', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            //Cho phép API này đợi tối đa 5 phút (300,000 ms)
            // vì AI bóc băng cần thời gian xử lý deep learning.
            timeout: 300000
        });
    },
    checkAnswer: (id, data) => {
        return axiosInstance.post(`/dictation/${id}/check`, data);
    },

    updateStatus: (id, status) => {
        return axiosInstance.put(`/dictation/${id}/status`, null, {
            params: { status }
        });
    },

    // 5. Cập nhật chi tiết bài nghe (Sửa chữ, level...)
    updateLesson: (id, data) => {
        return axiosInstance.put(`/dictation/${id}`, data);
    }

};
// Thêm vào config/api.js để quản lý thông tin User
export const userAPI = {
    // Lấy thông tin chi tiết của user đang đăng nhập (XP, Level, Streak, Avatar...)
    getProfile: () => {
        return axiosInstance.get('/users/me');
    }
};
// Thêm vào config/api.js để quản lý Bảng xếp hạng
export const leaderboardAPI = {
    // Lấy bảng xếp hạng chuỗi ngày học liên tiếp (Streak)
    getStreak: () => {
        return axiosInstance.get('/leaderboard/streak');
    },

    // Lấy bảng xếp hạng tổng điểm kinh nghiệm (XP)
    getTotalXp: () => {
        return axiosInstance.get('/leaderboard/total-xp');
    }
};
// Thêm vào cuối file api.js để quản lý hệ thống Thông báo
export const notificationAPI = {
    // Lấy danh sách thông báo của user hiện tại
    getMyNotifications: () => {
        return axiosInstance.get('/notifications');
    },

    // Đếm số lượng thông báo chưa đọc để hiển thị badge quả chuông
    getUnreadCount: () => {
        return axiosInstance.get('/notifications/unread-count');
    },

    // Đánh dấu một thông báo cụ thể đã đọc
    markAsRead: (notificationId) => {
        return axiosInstance.put(`/notifications/${notificationId}/read`);
    },

    // Đánh dấu tất cả thông báo là đã đọc
    markAllAsRead: () => {
        return axiosInstance.put('/notifications/read-all');
    }
};

// ============================================================
// THÊM VÀO CUỐI FILE config/api.js (hoặc axiosConfig)
// ============================================================

export const pronunciationAPI = {
    // ── Topics ────────────────────────────────────────────────
    // GET /api/topics  →  danh sách tất cả topics (summary)
    getAllTopics: () =>
        axiosInstance.get('/topics'),

    // GET /api/topics/:id  →  chi tiết topic kèm sentences
    getTopicById: (id) =>
        axiosInstance.get(`/topics/${id}`),

    // POST /api/topics  →  tạo topic mới
    createTopic: (data) =>
        axiosInstance.post('/topics', data),
    // data: { name, description, level, sentences?: [] }

    // PUT /api/topics/:id  →  cập nhật topic
    updateTopic: (id, data) =>
        axiosInstance.put(`/topics/${id}`, data),

    // DELETE /api/topics/:id  →  xóa topic
    deleteTopic: (id) =>
        axiosInstance.delete(`/topics/${id}`),

    // ── Sentences ─────────────────────────────────────────────
    // POST /api/topics/:id/sentences  →  thêm câu vào topic
    addSentences: (topicId, sentences) =>
        axiosInstance.post(`/topics/${topicId}/sentences`, { sentences }),
    // sentences: string[]

    // DELETE /api/topics/:id/sentences/:index  →  xóa câu theo index
    removeSentence: (topicId, index) =>
        axiosInstance.delete(`/topics/${topicId}/sentences/${index}`),

    // ── Pronunciation Check History ───────────────────────────
    // GET /api/pronunciation-check/history
    getAllHistory: () =>
        axiosInstance.get('/pronunciation-check/history'),

    // GET /api/pronunciation-check/history/:id
    getHistoryById: (id) =>
        axiosInstance.get(`/pronunciation-check/history/${id}`),

    // DELETE /api/pronunciation-check/history/:id
    deleteHistory: (id) =>
        axiosInstance.delete(`/pronunciation-check/history/${id}`),

    // ── Pronunciation Check ───────────────────────────────────
    // POST /api/pronunciation-check  →  check phát âm
    checkPronunciation: (formData) =>
        axiosInstance.post('/pronunciation-check', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000, // 2 phút, Gemini cần thời gian
        }),

    // GET /api/pronunciation-check/random-sentence?topic=...
    getRandomSentence: (topicName) =>
        axiosInstance.get('/pronunciation-check/random-sentence', {
            params: { topic: topicName },
        }),
};
