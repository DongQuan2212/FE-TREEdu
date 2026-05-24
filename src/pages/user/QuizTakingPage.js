import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from '../../config/axiosConfig';

import { notify } from '../../utils/toastNotify';
import {
    showConfirmDialog,
    showErrorDialog,
    showSuccessDialog,
    showInfoDialog
} from '../../utils/confirmation';

// ⭐ THÊM: Import thêm Star, Award, Zap để làm icon cho phần XP và Level
import {
    Clock, CheckCircle, XCircle, ChevronLeft,
    ChevronRight, Flag, CheckSquare, RotateCcw,
    Star, Award, Zap
} from 'lucide-react';

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [attemptId, setAttemptId] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!showResult && !submitting && timeLeft > 0) {
                const message = "Dữ liệu chưa lưu sẽ bị mất.";
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [showResult, submitting, timeLeft]);

    // 2. Start Quiz
    useEffect(() => {
        const start = async () => {
            try {
                const res = await axiosInstance.post(`/quiz/${quizId}/start`);
                const d = res.data.data;

                setAttemptId(d.attemptId);
                setQuiz(d.quiz);
                setQuestions(d.quiz.questions || []);
                setTimeLeft(d.timeRemainingSeconds);
                setLoading(false);

                notify.success(`Bắt đầu: ${d.quiz.title}`);

            } catch (err) {
                console.error("Lỗi start:", err);
                await showErrorDialog("Không thể tải bài thi hoặc bài thi không tồn tại.", "Lỗi kết nối");
                navigate('/quiz');
            }
        };
        start();
    }, [quizId, navigate]);

    // 3. Timer (Xử lý hết giờ)
    useEffect(() => {
        if (loading || showResult || !timeLeft) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, showResult]);

    // --- HANDLERS ---
    const handleTimeUp = async () => {
        await showInfoDialog("Thời gian làm bài đã kết thúc. Hệ thống sẽ tự động nộp bài.", "Hết giờ!");
        handleSubmit(true);
    };

    const formatTime = (s) => {
        const min = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    const selectAnswer = (questionId, answerId) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const toggleFlag = (questionId) => {
        setFlags(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    const handleRetakeQuiz = async () => {
        const isConfirmed = await showConfirmDialog({
            title: "Làm lại bài thi?",
            text: "Tiến trình hiện tại sẽ bị hủy và trang sẽ tải lại.",
            confirmText: "Làm lại ngay",
            cancelText: "Hủy"
        });

        if (isConfirmed) {
            window.location.reload();
        }
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (!isAutoSubmit) {
            const isConfirmed = await showConfirmDialog({
                title: "Nộp bài thi?",
                text: "Hãy kiểm tra kỹ các câu hỏi đã đánh dấu (Flag) trước khi nộp.",
                confirmText: "Vâng, nộp bài",
                cancelText: "Kiểm tra lại"
            });
            if (!isConfirmed) return;
        }

        if (submitting) return;
        setSubmitting(true);

        const payload = {
            attemptId: attemptId,
            answers: Object.entries(answers).map(([qId, aId]) => ({
                questionId: qId,
                selectedAnswerId: aId
            }))
        };

        try {
            const res = await axiosInstance.post(`/quiz/${quizId}/submit`, payload);
            if (res.data.success) {
                setResult(res.data.data);
                await showSuccessDialog("Hệ thống đã ghi nhận kết quả của bạn.", "Nộp bài thành công!");
                setShowResult(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Lỗi submit:", err);
            const msg = err.response?.data?.message || "Vui lòng kiểm tra kết nối mạng.";
            await showErrorDialog(msg, "Nộp bài thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIdx < questions.length - 1) setCurrentIdx(c => c + 1);
    };

    const handlePrev = () => {
        if (currentIdx > 0) setCurrentIdx(c => c - 1);
    };

    // --- LOADING SKELETON ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-6xl mx-auto animate-pulse space-y-8">
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // --- RESULT VIEW ---
    if (showResult && result) {
        const percentage = result.percentage || 0;
        const isPass = percentage >= 50;

        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
                        {/* Result Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden mb-8">
                            <div className={`p-8 text-center ${isPass ? 'bg-gradient-to-b from-emerald-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
                                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm ${isPass ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {isPass ? <CheckCircle size={48} /> : <XCircle size={48} />}
                                </div>
                                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                                    {isPass ? 'Làm bài tốt lắm!' : 'Cần cố gắng hơn!'}
                                </h1>
                                <p className="text-zinc-500 mb-6">Kết quả bài thi: <b>{quiz?.title}</b></p>

                                {/* Gốc: Bảng Điểm số */}
                                <div className="flex justify-center gap-8 mb-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-zinc-900">{result.score}/{result.totalQuestions}</div>
                                        <div className="text-xs text-zinc-500 uppercase font-medium tracking-wide mt-1">Câu đúng</div>
                                    </div>
                                    <div className="w-px bg-zinc-200 h-12"></div>
                                    <div className="text-center">
                                        <div className={`text-3xl font-bold ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {percentage}%
                                        </div>
                                        <div className="text-xs text-zinc-500 uppercase font-medium tracking-wide mt-1">Điểm số</div>
                                    </div>
                                </div>

                                {/* ⭐ MỚI: Bảng chỉ số Gamification (XP & Level) */}
                                <div className="flex justify-center gap-8 mb-6 p-4 bg-zinc-50/70 rounded-2xl border border-zinc-200 max-w-sm mx-auto shadow-sm">
                                    <div className="text-center w-1/2">
                                        <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                                            <Star size={24} fill="currentColor" className="text-yellow-400"/> +{result.xpGained || 0}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-zinc-500 uppercase font-medium tracking-wide mt-1">XP Nhận được</div>
                                    </div>
                                    <div className="w-px bg-zinc-200 h-10 my-auto"></div>
                                    <div className="text-center w-1/2">
                                        <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                                            <Award size={24} className="text-blue-500"/> {result.currentLevel || 1}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-zinc-500 uppercase font-medium tracking-wide mt-1">Cấp độ hiện tại</div>
                                    </div>
                                </div>

                                {/* ⭐ MỚI: Banner chúc mừng Thăng Cấp */}
                                {result.leveledUp && (
                                    <div className="mb-8 mx-auto max-w-sm p-3 bg-gradient-to-r from-amber-100 to-yellow-100 border border-yellow-300 rounded-xl text-yellow-800 font-bold flex items-center justify-center gap-2 animate-bounce shadow-sm">
                                        <Zap size={20} className="text-yellow-600" fill="currentColor" />
                                        Tuyệt vời! Bạn đã thăng lên Cấp {result.currentLevel}
                                    </div>
                                )}

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => navigate('/quiz')}
                                        className="px-6 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                                    >
                                        Về danh sách
                                    </button>

                                    <button
                                        onClick={handleRetakeQuiz}
                                        className="px-6 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors shadow-lg flex items-center gap-2"
                                    >
                                        <RotateCcw size={18} />
                                        Làm lại bài
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-zinc-900 px-2 flex items-center gap-2">
                                <CheckSquare size={20} /> Chi tiết bài làm
                            </h3>
                            {result.results?.map((r, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            {r.correct ? <CheckCircle className="text-emerald-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-zinc-900 text-lg mb-3">
                                                <span className="text-zinc-400 font-medium mr-2">Câu {idx + 1}:</span>{r.content}
                                            </p>
                                            <div className="space-y-2 mb-3">
                                                <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${r.correct ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    <span className="font-bold min-w-[80px]">Bạn chọn:</span>
                                                    {r.selectedAnswer || <span className="italic opacity-70">Không trả lời</span>}
                                                </div>
                                                {!r.correct && (
                                                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center gap-2 text-sm">
                                                        <span className="font-bold min-w-[80px]">Đáp án đúng:</span>
                                                        {r.correctAnswer}
                                                    </div>
                                                )}
                                            </div>
                                            {r.explanation && (
                                                <div className="mt-2 text-sm text-zinc-500 italic pl-3 border-l-2 border-zinc-200">
                                                    Giải thích: {r.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // --- ACTIVE QUIZ VIEW ---
    const q = questions[currentIdx];
    const isLastQuestion = currentIdx === questions.length - 1;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;
    const isCurrentFlagged = flags[q.questionId];

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            <Header />

            <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden min-h-[500px] flex flex-col">
                            {/* Question Header */}
                            <div className="p-6 sm:p-8 border-b border-zinc-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-sm font-bold">
                                        Câu hỏi {currentIdx + 1}
                                    </span>

                                    <button
                                        onClick={() => toggleFlag(q.questionId)}
                                        className={`transition-all duration-200 p-2 rounded-full hover:bg-zinc-100 
                                            ${isCurrentFlagged ? 'text-yellow-500' : 'text-zinc-300 hover:text-yellow-400'}`}
                                        title={isCurrentFlagged ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}
                                    >
                                        <Flag
                                            size={24}
                                            fill={isCurrentFlagged ? "currentColor" : "none"}
                                        />
                                    </button>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 leading-relaxed">
                                    {q.content}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="flex-1 p-6 sm:p-8 bg-zinc-50/30 space-y-3">
                                {q.options.map((opt) => {
                                    const isSelected = answers[q.questionId] === opt.answerId;
                                    return (
                                        <div
                                            key={opt.answerId}
                                            onClick={() => selectAnswer(q.questionId, opt.answerId)}
                                            className={`relative group cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4
                                                ${isSelected
                                                ? 'bg-emerald-50/50 border-emerald-500 shadow-md z-10'
                                                : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                                                ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 group-hover:border-zinc-400'}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                            </div>
                                            <span className={`text-base font-medium ${isSelected ? 'text-emerald-900' : 'text-zinc-700'}`}>
                                                {opt.content}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer Nav */}
                            <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 flex items-center justify-between mt-auto">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIdx === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                                        ${currentIdx === 0 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                                >
                                    <ChevronLeft size={20} /> Câu trước
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isLastQuestion}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors
                                        ${isLastQuestion ? 'text-zinc-300 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md'}`}
                                >
                                    Câu tiếp theo <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-28">

                            <div className="mb-6">
                                <h1 className="font-bold text-xl text-zinc-900 leading-tight mb-1">{quiz?.title}</h1>
                                <p className="text-xs text-zinc-400 font-medium">ID: #{attemptId?.toString().slice(-6)}</p>
                            </div>

                            <div className={`flex items-center justify-between p-4 rounded-xl mb-6 border-2 ${timeLeft < 60 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-zinc-50 border-zinc-100 text-zinc-800'}`}>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">Thời gian còn lại</span>
                                    <span className="text-2xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</span>
                                </div>
                                <Clock size={32} className="opacity-80" strokeWidth={1.5} />
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-medium text-zinc-500">Tiến độ</span>
                                    <span className="text-sm font-bold text-zinc-900">{Math.round(progressPercent)}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>

                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-t border-zinc-100 pt-6">
                                Danh sách câu hỏi
                            </h3>

                            <div className="grid grid-cols-6 gap-2 mb-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {questions.map((qItem, i) => {
                                    const isCurrent = i === currentIdx;
                                    const isAnswered = answers[qItem.questionId];
                                    const isFlagged = flags[qItem.questionId];

                                    let btnClass = "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-transparent";

                                    if (isFlagged) {
                                        btnClass = "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 shadow-sm";
                                    } else if (isAnswered) {
                                        btnClass = "bg-emerald-500 text-white shadow-sm border-transparent";
                                    }

                                    const activeClass = isCurrent ? "ring-2 ring-zinc-900 ring-offset-2 z-10" : "";

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIdx(i)}
                                            className={`aspect-square rounded-lg text-sm font-bold transition-all duration-200 relative border ${btnClass} ${activeClass}`}
                                        >
                                            {i + 1}
                                            {isFlagged && isAnswered && (
                                                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full border border-white"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? "Đang nộp..." : <><CheckCircle size={20} /> Nộp bài thi</>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default QuizTakingPage;
