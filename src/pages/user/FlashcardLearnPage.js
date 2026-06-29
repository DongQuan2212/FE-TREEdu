import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from "../../config/api";
import { X, RotateCcw, CheckCircle, Volume2, XCircle } from "lucide-react";


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

        {leveledUp && (
            <div className="mb-6 animate-bounce bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 border-2 border-white">
                <span className="text-xl">🎉</span>
                <span>THĂNG CẤP!</span>
                <span className="text-xl">🎉</span>
            </div>
        )}

        <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <span className="text-6xl animate-pulse">🏆</span>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Xuất sắc!</h2>
        <p className="text-gray-600 mb-6 max-w-md text-lg">
            Bạn đã chinh phục thành công <span className="font-bold text-emerald-600">{totalWords}</span> từ vựng.
        </p>

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
    const [toast, setToast] = useState(null);

    // Typing States
    const [userAnswer, setUserAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [checkResult, setCheckResult] = useState(null); // { correct: bool, correctAnswer: string } | null

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchFlashcard = useCallback(async () => {
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
    }, [id, navigate]);
    useEffect(() => {
        fetchFlashcard();
    }, [id, fetchFlashcard]);

    const resetTypingState = () => {
        setUserAnswer("");
        setCheckResult(null);
    };

    const handleSubmitAnswer = async (currentWord) => {
        if (!userAnswer.trim() || submitting) return;

        try {
            setSubmitting(true);
            const res = await flashcardAPI.submitAnswer(id, {
                wordId: currentWord.id,
                userAnswer: userAnswer.trim(),
            });

            const data = res.data.data; // WordCheckResponse
            setCheckResult({ correct: data.correct, correctAnswer: data.correctAnswer });

            if (data.correct) {
                showToast("Chính xác!", "success");

                // Đợi người dùng thấy phản hồi đúng rồi mới chuyển sang từ tiếp theo
                setTimeout(() => {
                    setIsFlipped(false);

                    setTimeout(() => {
                        if (data.progress) {
                            setFlashcard(data.progress);
                        } else {
                            // Trường hợp backend không trả progress (hiếm) -> cập nhật thủ công
                            setFlashcard(prev => ({
                                ...prev,
                                viewedWordIds: [...prev.viewedWordIds, currentWord.id],
                                viewedWordCount: prev.viewedWordCount + 1,
                            }));
                        }
                        resetTypingState();
                    }, 300);
                }, 900);
            } else {
                showToast("Sai rồi, thử lại nhé!", "error");
            }
        } catch (err) {
            console.error("Submit answer error:", err);
            showToast("Lỗi kết nối, vui lòng thử lại", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = async () => {
        try {
            setResetting(true);
            await flashcardAPI.resetProgress(id);
            showToast("Đã reset tiến độ học tập!", "success");
            await fetchFlashcard();
            setIsFlipped(false);
            resetTypingState();
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

                    {/* Progress Bar */}
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

                                    <div className="text-center space-y-5 w-full max-w-sm">
                                        <div>
                                            <p className="text-sm text-emerald-600/70 font-semibold mb-2 uppercase">Ý nghĩa</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                                                {currentWord.meaning}
                                            </h3>
                                        </div>

                                        {currentWord.example && (
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/50">
                                                <p className="text-sm text-emerald-600/70 font-semibold mb-1 uppercase text-left">Ví dụ</p>
                                                <p className="text-lg text-gray-600 italic leading-relaxed">
                                                    "{currentWord.example}"
                                                </p>
                                            </div>
                                        )}

                                        {/* TYPING AREA */}
                                        <div
                                            className="pt-2"
                                            onClick={(e) => e.stopPropagation()} // Ngăn lật thẻ khi tương tác với input
                                        >
                                            <p className="text-sm text-emerald-600/70 font-semibold mb-2 uppercase text-left">
                                                Gõ lại từ vựng
                                            </p>
                                            <input
                                                type="text"
                                                value={userAnswer}
                                                onChange={(e) => setUserAnswer(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSubmitAnswer(currentWord);
                                                    }
                                                }}
                                                placeholder="Nhập từ vựng..."
                                                disabled={submitting || checkResult?.correct}
                                                className={`w-full px-4 py-3 rounded-xl border-2 text-lg font-semibold text-center outline-none transition-all
                                                    ${checkResult?.correct
                                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                                        : checkResult?.correct === false
                                                            ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-400'
                                                            : 'border-gray-200 bg-white focus:border-emerald-400'
                                                    }`}
                                            />

                                            {/* Feedback */}
                                            {checkResult && (
                                                <div className={`mt-2 flex items-center justify-center gap-2 text-sm font-semibold
                                                    ${checkResult.correct ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {checkResult.correct ? (
                                                        <>
                                                            <CheckCircle size={16} />
                                                            <span>Chính xác!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={16} />
                                                            <span>Chưa đúng, thử lại nhé</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleSubmitAnswer(currentWord)}
                                                disabled={submitting || !userAnswer.trim() || checkResult?.correct}
                                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                            >
                                                {submitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle size={20} />
                                                        <span>Kiểm tra</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hint khi chưa lật thẻ */}
                            {!isFlipped && (
                                <div className="mt-8 flex justify-center">
                                    <p className="text-sm text-gray-400 italic">
                                        Chạm vào thẻ để xem nghĩa và nhập từ vựng
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

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
