import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from '../../config/axiosConfig'; // Đảm bảo import đúng

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [attemptId, setAttemptId] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    // 1. Start Quiz
    useEffect(() => {
        const start = async () => {
            try {
                const res = await axiosInstance.post(`/quiz/${quizId}/start`);
                const d = res.data.data;

                setAttemptId(d.attemptId); // Lưu attemptId để dùng khi submit
                setQuiz(d.quiz);
                setQuestions(d.quiz.questions);
                setTimeLeft(d.timeRemainingSeconds);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi start:", err);
                alert("Không thể bắt đầu bài quiz. Vui lòng thử lại.");
                navigate('/quiz');
            }
        };
        start();
    }, [quizId, navigate]);

    // Timer đếm ngược
    useEffect(() => {
        if (!timeLeft) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Hết giờ -> Tự nộp
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]); // Dependency timeLeft để an toàn

    const formatTime = (s) => {
        const min = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    const selectAnswer = (questionId, answerId) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    // 2. Submit Quiz
    const handleSubmit = async (isAutoSubmit = false) => {
        if (!isAutoSubmit && !window.confirm("Bạn chắc chắn muốn nộp bài?")) return;
        if (submitting) return;

        setSubmitting(true);

        // Format data đúng chuẩn Backend yêu cầu
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
            }
        } catch (err) {
            console.error("Lỗi submit:", err);
            // Hiển thị lỗi chi tiết từ Server
            const msg = err.response?.data?.message || "Lỗi kết nối server!";
            alert(`Nộp bài thất bại: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    // --- RENDER ---

    if (loading) return <div className="pt-20 text-center">Đang tải bài thi...</div>;

    if (showResult && result) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 px-4 pb-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-xl p-10">
                            <h1 className="text-4xl font-bold mb-4">Kết Quả</h1>
                            <div className="text-6xl font-bold text-green-600 mb-2">
                                {result.score} / {result.totalQuestions}
                            </div>
                            <p className="text-xl text-gray-600 mb-8">Điểm số: {result.percentage}%</p>

                            {/* Nút thao tác */}
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate('/history')}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Về danh sách
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Làm lại
                                </button>
                            </div>

                            {/* Chi tiết đáp án (Optional) */}
                            <div className="mt-8 text-left space-y-4">
                                <h3 className="text-2xl font-bold border-b pb-2">Chi tiết</h3>
                                {result.results && result.results.map((r, idx) => (
                                    <div key={idx} className={`p-4 rounded border ${r.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <p className="font-bold">Câu {idx+1}: {r.content}</p>
                                        <p>Bạn chọn: {r.selectedAnswer}</p>
                                        {!r.correct && <p className="text-green-700">Đáp án đúng: {r.correctAnswer}</p>}
                                        <p className="text-sm text-gray-500 mt-1">Giải thích: {r.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Render giao diện làm bài (Giữ nguyên UI của bạn)
    const q = questions[currentIdx];
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pt-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header: Title + Timer */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4">
                        <h1 className="text-xl font-bold">{quiz.title}</h1>
                        <div className="text-right">
                            <span className="text-gray-500 text-sm">Thời gian: </span>
                            <span className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-green-600'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cột trái: Câu hỏi */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                            <div className="mb-4 text-gray-500">Câu {currentIdx + 1} / {questions.length}</div>
                            <h2 className="text-lg font-medium mb-6">{q.content}</h2>
                            <div className="space-y-3">
                                {q.options.map(opt => (
                                    <button
                                        key={opt.answerId}
                                        onClick={() => selectAnswer(q.questionId, opt.answerId)}
                                        className={`w-full text-left p-4 rounded border transition
                                            ${answers[q.questionId] === opt.answerId
                                            ? 'bg-green-100 border-green-500 text-green-800'
                                            : 'hover:bg-gray-50 border-gray-200'}`}
                                    >
                                        {opt.content}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cột phải: Navigation */}
                        <div className="bg-white p-6 rounded-lg shadow h-fit">
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {questions.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIdx(i)}
                                        className={`p-2 rounded font-bold text-sm
                                            ${i === currentIdx ? 'ring-2 ring-green-500' : ''}
                                            ${answers[questions[i].questionId] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                                        `}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {submitting ? 'Đang nộp...' : 'Nộp Bài'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default QuizTakingPage;
