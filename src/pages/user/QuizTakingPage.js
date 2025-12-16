import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from '../../config/axiosConfig';
import {
    Clock, CheckCircle, XCircle, ChevronLeft,
    ChevronRight, Flag, AlertCircle, CheckSquare
} from 'lucide-react';

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [attemptId, setAttemptId] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: answerId }
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    // --- EFFECTS ---

    // 1. Start Quiz
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
            } catch (err) {
                console.error("Lỗi start:", err);
                alert("Không thể bắt đầu bài quiz hoặc bài quiz không tồn tại.");
                navigate('/quiz');
            }
        };
        start();
    }, [quizId, navigate]);

    // 2. Timer
    useEffect(() => {
        if (loading || showResult || !timeLeft) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, showResult]);

    // --- HANDLERS ---

    const formatTime = (s) => {
        const min = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    const selectAnswer = (questionId, answerId) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (!isAutoSubmit && !window.confirm("Bạn chắc chắn muốn nộp bài?")) return;
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
                setShowResult(true);
                // Cuộn lên đầu trang khi có kết quả
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Lỗi submit:", err);
            const msg = err.response?.data?.message || "Lỗi kết nối server!";
            alert(`Nộp bài thất bại: ${msg}`);
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
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
                            </div>
                        </div>
                        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // --- RESULT VIEW ---
    if (showResult && result) {
        const percentage = result.percentage || 0;
        const isPass = percentage >= 50; // Giả sử 50% là đậu

        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto ">

                        {/* Result Summary Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
                            <div className={`p-8 text-center ${isPass ? 'bg-gradient-to-b from-emerald-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
                                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm ${isPass ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {isPass ? <CheckCircle size={48} /> : <XCircle size={48} />}
                                </div>
                                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                                    {isPass ? 'Làm bài tốt lắm!' : 'Cần cố gắng hơn!'}
                                </h1>
                                <p className="text-zinc-500 mb-6">Bạn đã hoàn thành bài kiểm tra <b>{quiz?.title}</b></p>

                                <div className="flex justify-center gap-8 mb-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-zinc-900">{result.score}/{result.totalQuestions}</div>
                                        <div className="text-xs text-zinc-500 uppercase font-medium tracking-wide">Câu đúng</div>
                                    </div>
                                    <div className="w-px bg-zinc-200 h-12"></div>
                                    <div className="text-center">
                                        <div className={`text-3xl font-bold ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {percentage}%
                                        </div>
                                        <div className="text-xs text-zinc-500 uppercase font-medium tracking-wide">Điểm số</div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => navigate('/quiz')}
                                        className="px-6 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                                    >
                                        Về danh sách
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                                    >
                                        Làm lại bài
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-zinc-900 px-2 flex items-center gap-2">
                                <CheckSquare size={20} />
                                Chi tiết bài làm
                            </h3>
                            {result.results?.map((r, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0">
                                            {r.correct ? (
                                                <CheckCircle className="text-emerald-500" size={24} />
                                            ) : (
                                                <XCircle className="text-red-500" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-zinc-900 text-lg mb-3">
                                                <span className="text-zinc-400 font-medium mr-2">Câu {idx + 1}:</span>
                                                {r.content}
                                            </p>

                                            <div className="space-y-2 mb-3">
                                                {/* Hiển thị câu trả lời của user */}
                                                <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${
                                                    r.correct
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                        : 'bg-red-50 border-red-200 text-red-800'
                                                }`}>
                                                    <span className="font-bold min-w-[80px]">Bạn chọn:</span>
                                                    {r.selectedAnswer || <span className="italic opacity-70">Không trả lời</span>}
                                                </div>

                                                {/* Nếu sai thì hiện đáp án đúng */}
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

// ... (Giữ nguyên các phần import và logic phía trên)

    // --- ACTIVE QUIZ VIEW ---
    const q = questions[currentIdx];
    const isLastQuestion = currentIdx === questions.length - 1;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            <Header />

            {/* Đã xóa thanh Sticky Header ở đây để giao diện thoáng hơn */}

            <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT COLUMN: Question Content (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden min-h-[500px] flex flex-col">
                            {/* Question Header */}
                            <div className="p-6 sm:p-8 border-b border-zinc-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-sm font-bold">
                                        Câu hỏi {currentIdx + 1}
                                    </span>
                                    <button className="text-zinc-400 hover:text-yellow-500 transition-colors" title="Đánh dấu câu hỏi">
                                        <Flag size={20} />
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

                            {/* Navigation Footer */}
                            <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 flex items-center justify-between mt-auto">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIdx === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                                        ${currentIdx === 0
                                        ? 'text-zinc-300 cursor-not-allowed'
                                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                                >
                                    <ChevronLeft size={20} />
                                    Câu trước
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={isLastQuestion}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors
                                        ${isLastQuestion
                                        ? 'text-zinc-300 cursor-not-allowed'
                                        : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-200'}`}
                                >
                                    Câu tiếp theo
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Control Panel (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-28">

                            {/* 1. Quiz Info Header */}
                            <div className="mb-6">
                                <h1 className="font-bold text-xl text-zinc-900 leading-tight mb-1">
                                    {quiz?.title}
                                </h1>
                                <p className="text-xs text-zinc-400 font-medium">
                                    ID Bài thi: #{attemptId?.toString().slice(-6)}
                                </p>
                            </div>

                            {/* 2. Timer Box (Nổi bật) */}
                            <div className={`flex items-center justify-between p-4 rounded-xl mb-6 border-2 ${
                                timeLeft < 60
                                    ? 'bg-red-50 border-red-100 text-red-600 animate-pulse'
                                    : 'bg-zinc-50 border-zinc-100 text-zinc-800'
                            }`}>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">Thời gian còn lại</span>
                                    <span className="text-2xl font-mono font-bold tracking-tight">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <Clock size={32} className="opacity-80" strokeWidth={1.5} />
                            </div>

                            {/* 3. Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-medium text-zinc-500">Tiến độ hoàn thành</span>
                                    <span className="text-sm font-bold text-zinc-900">
                                        {Math.round(progressPercent)}%
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <div className="text-right mt-1 text-xs text-zinc-400">
                                    Đã làm: <span className="font-medium text-zinc-700">{answeredCount}/{questions.length}</span> câu
                                </div>
                            </div>

                            {/* 4. Question Grid */}
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-t border-zinc-100 pt-6">
                                Danh sách câu hỏi
                            </h3>

                            <div className="grid grid-cols-5 gap-2 mb-6 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {questions.map((_, i) => {
                                    const isCurrent = i === currentIdx;
                                    const isAnswered = answers[questions[i].questionId];

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIdx(i)}
                                            className={`aspect-square rounded-lg text-sm font-bold transition-all duration-200 relative border
                                                ${isCurrent
                                                ? 'ring-2 ring-zinc-900 ring-offset-2 z-10 border-transparent'
                                                : 'border-transparent'}
                                                ${isAnswered
                                                ? 'bg-emerald-500 text-white shadow-sm'
                                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}
                                            `}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 5. Submit Button */}
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang nộp...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        Nộp bài thi
                                    </>
                                )}
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
