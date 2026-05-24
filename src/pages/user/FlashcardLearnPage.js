import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from "../../config/api";
import { X, RotateCcw, CheckCircle, ChevronRight, Volume2 } from "lucide-react"; // Cần cài lucide-react

// --- SUB-COMPONENT: TOAST NOTIFICATION ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        info: "bg-blue-500"
    };

    return (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-in slide-in-from-right ${bgColors[type] || bgColors.info}`}>
            <span>{message}</span>
        </div>
    );
};

// --- SUB-COMPONENT: COMPLETION SCREEN ---
const CompletionScreen = ({ totalWords, xpGained, leveledUp, onReset, onExit, resetting }) => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in zoom-in duration-500">

        {/* Banner Thăng Cấp (Chỉ hiện khi levelUp = true) */}
        {leveledUp && (
            <div className="mb-6 animate-bounce bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 border-2 border-white">
                <span className="text-xl">🎉</span>
                <span>THĂNG CẤP!</span>
                <span className="text-xl">🎉</span>
            </div>
        )}

        {/* Icon Cúp */}
        <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <span className="text-6xl animate-pulse">🏆</span>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Xuất sắc!</h2>
        <p className="text-gray-600 mb-6 max-w-md text-lg">
            Bạn đã chinh phục thành công <span className="font-bold text-emerald-600">{totalWords}</span> từ vựng.
        </p>

        {/* Khung hiển thị XP nhận được */}
        {(xpGained > 0 || xpGained != null) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 w-full max-w-xs flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-default">
                <span className="text-amber-600 font-semibold text-xs uppercase tracking-wider mb-1">
                    Điểm kinh nghiệm
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-4xl font-black text-amber-500">+{xpGained || 0}</span>
                    <span className="text-amber-500 font-bold text-xl mt-1">XP</span>
                </div>
            </div>
        )}

        {/* Nút điều hướng */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
                onClick={onReset}
                disabled={resetting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 font-semibold"
            >
                {resetting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <RotateCcw size={20} />
                        <span>Học lại</span>
                    </>
                )}
            </button>
            <button
                onClick={onExit}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
            >
                Quay lại
            </button>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
function FlashcardLearnPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data States
    const [flashcard, setFlashcard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    // UI States
    const [isFlipped, setIsFlipped] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    // Logic Helper
    const showToast = (message, type = 'success') => setToast({ message, type });

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
            console.error("Fetch error:", err);
            showToast("Không thể tải flashcard", "error");
            setTimeout(() => navigate("/flashcard/me"), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        const unviewedWords = flashcard.words.filter(
            word => !flashcard.viewedWordIds.includes(word.id)
        );
        const currentWord = unviewedWords[0];

        if (!currentWord) return;

        try {
            // Gọi API đánh dấu đã học
            const res = await flashcardAPI.markViewed(id, { wordId: currentWord.id });

            // Xử lý UI: Lật thẻ lại mặt trước trước khi chuyển từ
            setIsFlipped(false);

            // Đợi animation lật thẻ (300ms) rồi mới cập nhật dữ liệu
            setTimeout(() => {
                if (!res.data.data) {
                    // Trường hợp backend trả về null nghĩa là đã hết từ -> Reload để hiển thị màn hình hoàn thành
                    // Hoặc cập nhật state thủ công để trigger màn hình hoàn thành
                    setFlashcard(prev => ({
                        ...prev,
                        viewedWordIds: [...prev.viewedWordIds, currentWord.id],
                        viewedWordCount: prev.viewedWordCount + 1,
                        progressPercentage: 100
                    }));
                } else {
                    setFlashcard(res.data.data);
                }
            }, 200);

        } catch (err) {
            console.error("Next error:", err);
            showToast("Lỗi kết nối, vui lòng thử lại", "error");
        }
    };

    const handleReset = async () => {
        try {
            setResetting(true);
            await flashcardAPI.resetProgress(id); // Gọi API Reset bạn cung cấp
            showToast("Đã reset tiến độ học tập!", "success");
            await fetchFlashcard(); // Tải lại dữ liệu mới
            setIsFlipped(false);
        } catch (err) {
            console.error("Reset error:", err);
            showToast("Không thể reset bài học", "error");
        } finally {
            setResetting(false);
        }
    };

    // --- RENDER CONDITIONS ---

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center bg-neutral-50">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm font-medium">Đang tải bài học...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!flashcard) return null;

    // Filter từ chưa học
    const unviewedWords = flashcard.words.filter(
        word => !flashcard.viewedWordIds.includes(word.id)
    );
    const isCompleted = unviewedWords.length === 0;
    const currentWord = unviewedWords[0];

    return (
        <>
            <Header />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="min-h-screen bg-neutral-50 pt-28 pb-16 px-4 md:px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                                {flashcard.flashcardTitle}
                            </h1>
                            <span className="text-xs text-gray-500">Chế độ học từ vựng</span>
                        </div>
                        <button
                            onClick={() => navigate(`/flashcard/detail/${id}`)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all"
                            title="Thoát"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Bar (Chỉ hiện khi chưa hoàn thành) */}
                    {!isCompleted && (
                        <div className="mb-8">
                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                <span>Tiến độ</span>
                                <span>{flashcard.viewedWordCount} / {flashcard.totalWords}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${flashcard.progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* CONTENT AREA */}
                    {isCompleted ? (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                            <CompletionScreen
                                totalWords={flashcard.totalWords}
                                xpGained={flashcard.xpGained}
                                leveledUp={flashcard.leveledUp}
                                onReset={handleReset}
                                onExit={() => navigate(`/flashcard/detail/${id}`)}
                                resetting={resetting}
                            />
                        </div>
                    ) : (
                        <div className="perspective-1000">
                            {/* THE FLASHCARD CONTAINER */}
                            <div
                                className={`relative w-full h-[450px] cursor-pointer transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                {/* --- FRONT SIDE --- */}
                                <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg border-b-4 border-gray-200 p-8 flex flex-col items-center justify-center backface-hidden z-20">
                                    <div className="absolute top-6 left-6 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                        Từ Mới
                                    </div>

                                    {currentWord.imageURL && (
                                        <div className="w-48 h-48 mb-6 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                            <img
                                                src={currentWord.imageURL}
                                                alt="Word illustration"
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    )}

                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 text-center">
                                        {currentWord.newWord}
                                    </h2>
                                    {currentWord.phoneme && (
                                        <div className="flex items-center gap-2 text-gray-500 text-lg">
                                            <span>/{currentWord.phoneme}/</span>
                                            <Volume2 size={16} className="cursor-pointer hover:text-emerald-600" />
                                        </div>
                                    )}

                                    <p className="absolute bottom-6 text-xs text-gray-400 animate-pulse">
                                        Chạm để xem nghĩa
                                    </p>
                                </div>

                                {/* --- BACK SIDE --- */}
                                <div className="absolute inset-0 w-full h-full bg-emerald-50/50 rounded-3xl shadow-lg border-b-4 border-emerald-200 p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 z-10">
                                    <div className="absolute top-6 left-6 text-xs font-bold text-emerald-600 bg-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Định Nghĩa
                                    </div>

                                    <div className="text-center space-y-6">
                                        <div>
                                            <p className="text-sm text-emerald-600/70 font-semibold mb-2 uppercase">Ý nghĩa</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                                                {currentWord.meaning}
                                            </h3>
                                        </div>

                                        {currentWord.example && (
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/50 max-w-sm">
                                                <p className="text-sm text-emerald-600/70 font-semibold mb-1 uppercase text-left">Ví dụ</p>
                                                <p className="text-lg text-gray-600 italic leading-relaxed">
                                                    "{currentWord.example}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CONTROLS */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Ngăn sự kiện lật thẻ
                                        handleNext();
                                    }}
                                    className="group flex items-center gap-3 px-8 py-4 bg-neutral-900 text-white rounded-2xl hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                                >
                                    <span className="font-semibold text-lg">Tiếp theo</span>
                                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Styles for Flip Effect (Nếu dự án chưa có CSS 3D) */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>

            <Footer />
        </>
    );
}

export default FlashcardLearnPage;
