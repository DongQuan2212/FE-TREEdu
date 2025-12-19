
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
};

