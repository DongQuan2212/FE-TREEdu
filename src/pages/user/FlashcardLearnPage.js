import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from "../../config/api";

function FlashcardLearnPage() {
    const { id } = useParams(); // flashcardId
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [showMeaning, setShowMeaning] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlashcard();
    }, [id]);

    const fetchFlashcard = async () => {
        try {
            setLoading(true);
            const res = await flashcardAPI.startLearning(id);
            if (res.data.status === 200) {
                setFlashcard(res.data.data);
            }
        } catch (err) {
            console.error("Fetch flashcard error:", err);
            alert("Không thể tải flashcard");
            navigate("/flashcard/me");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        // Lấy từ hiện tại (từ đầu tiên trong mảng words chưa xem)
        const unviewedWords = flashcard.words.filter(
            word => !flashcard.viewedWordIds.includes(word.id)
        );

        const currentWord = unviewedWords[0];

        if (!currentWord || !currentWord.id) {
            alert("Không tìm thấy từ hiện tại");
            return;
        }

        try {
            setShowMeaning(false);

            // ✅ GỬI wordId trong body
            const res = await flashcardAPI.markViewed(id, { wordId: currentWord.id });

            // ❗ HẾT TỪ - Backend trả về data = null
            if (!res.data.data) {
                alert("Bạn đã học xong flashcard 🎉");
                navigate(`/flashcard/detail/${id}`);
                return;
            }

            // ✅ Cập nhật flashcard mới
            setFlashcard(res.data.data);
        } catch (err) {
            console.error("Mark viewed error:", err);
            alert("Lỗi khi chuyển sang từ tiếp theo");
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
                </main>
                <Footer />
            </>
        );
    }

    if (!flashcard || !flashcard.words || flashcard.words.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                    <p className="text-xl text-gray-700">Bạn đã học xong flashcard này! 🎉</p>
                    <button
                        onClick={() => navigate(`/flashcard/detail/${id}`)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Quay lại chi tiết
                    </button>
                </main>
                <Footer />
            </>
        );
    }

    // ✅ Filter ra các từ chưa xem
    const unviewedWords = flashcard.words.filter(
        word => !flashcard.viewedWordIds.includes(word.id)
    );

    // Nếu đã xem hết tất cả từ
    if (unviewedWords.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                    <div className="text-center space-y-4">
                        <p className="text-4xl">🎉</p>
                        <p className="text-2xl font-bold text-gray-900">Chúc mừng!</p>
                        <p className="text-lg text-gray-700">Bạn đã học xong {flashcard.totalWords} từ vựng</p>
                    </div>
                    <button
                        onClick={() => navigate(`/flashcard/detail/${id}`)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Quay lại chi tiết
                    </button>
                </main>
                <Footer />
            </>
        );
    }

    // ✅ Luôn lấy từ đầu tiên trong danh sách chưa xem
    const currentWord = unviewedWords[0];

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
                <div className="max-w-xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            {flashcard.flashcardTitle}
                        </h1>
                        <button
                            onClick={() => navigate(`/flashcard/detail/${id}`)}
                            className="text-sm text-gray-600 hover:underline"
                        >
                            Thoát học
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Tiến độ</span>
                            <span>{flashcard.viewedWordCount} / {flashcard.totalWords} từ ({Math.round(flashcard.progressPercentage)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-black h-2 rounded-full transition-all duration-300"
                                style={{ width: `${flashcard.progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Card học */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center space-y-6">
                        <h2 className="text-4xl font-bold text-gray-900">
                            {currentWord.newWord}
                        </h2>

                        {currentWord.phoneme && (
                            <p className="text-lg italic text-gray-500">
                                /{currentWord.phoneme}/
                            </p>
                        )}

                        {currentWord.imageURL && (
                            <div className="flex justify-center">
                                <img
                                    src={currentWord.imageURL}
                                    alt={currentWord.newWord}
                                    className="w-48 h-48 object-cover rounded-lg shadow"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        {showMeaning && (
                            <div className="space-y-4 pt-4 border-t">
                                <p className="text-xl text-green-700 font-medium">
                                    {currentWord.meaning}
                                </p>
                                {currentWord.example && (
                                    <p className="italic text-gray-600 bg-gray-50 p-4 rounded-lg">
                                        "{currentWord.example}"
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setShowMeaning(!showMeaning)}
                            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            {showMeaning ? "Ẩn nghĩa" : "Hiện nghĩa"}
                        </button>
                    </div>

                    {/* Next button */}
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow"
                        >
                            Từ tiếp theo →
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default FlashcardLearnPage;
