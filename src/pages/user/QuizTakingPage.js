import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [attemptId, setAttemptId] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // questionId → answerId
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const start = async () => {
            try {
                const res = await axios.post(`${API_URL}/quiz/${quizId}/start`);
                const d = res.data.data;
                setAttemptId(d.attemptId);
                setQuiz(d.quiz);
                setQuestions(d.quiz.questions);
                setTimeLeft(d.timeRemainingSeconds);

                const timer = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            handleSubmit();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                setLoading(false);
                return () => clearInterval(timer);
            } catch {
                alert("Không thể tải bài quiz!");
                navigate('/quiz');
            }
        };
        start();
    }, [quizId, navigate]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const selectAnswer = (questionId, answerId) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const goToQuestion = (idx) => setCurrentIdx(idx);

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        const payload = {
            attemptId,
            answers: Object.entries(answers).map(([qId, aId]) => ({ questionId: qId, selectedAnswerId: aId }))
        };

        try {
            const res = await axios.post(`${API_URL}/quiz/${quizId}/submit`, payload);
            setResult(res.data.data);
            setShowResult(true);
        } catch {
            alert("Lỗi nộp bài!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-2xl font-bold text-green-600">Đang tải...</div>
                </main>
                <Footer />
            </>
        );
    }

    if (showResult) {
        const percent = result.percentage.toFixed(1);
        const pass = result.score >= result.totalQuestions * 0.6;

        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 px-4 pb-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-2xl p-12">
                            <h1 className="text-5xl font-bold mb-6">{pass ? "Chúc mừng!" : "Cố lên nhé!"}</h1>
                            <div className={`text-8xl font-bold mb-4 ${pass ? 'text-green-600' : 'text-red-600'}`}>
                                {result.score}/{result.totalQuestions}
                            </div>
                            <p className="text-3xl mb-10">Đạt {percent}%</p>
                            <div className="flex gap-6 justify-center">
                                <button onClick={() => navigate('/quiz')} className="px-10 py-5 bg-green-600 text-white text-xl font-bold rounded-xl hover:bg-green-700 transition shadow-lg">
                                    Về danh sách
                                </button>
                                <button onClick={() => window.location.reload()} className="px-10 py-5 bg-gray-600 text-white text-xl font-bold rounded-xl hover:bg-gray-700 transition">
                                    Làm lại
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const q = questions[currentIdx];
    const answeredCount = Object.keys(answers).length;

    return (
        <>
            <Header />

            <main className="min-h-screen bg-gray-50 pt-20 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* Header: Title + Timer */}
                    <div className="text-black  p-6 mb-6 shadow-lg">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl md:text-3xl font-bold">{quiz.title}</h1>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Thời gian còn lại</p>
                                <p className={`text-3xl font-bold ${timeLeft < 120 ? 'text-red-300 animate-pulse' : ''}`}>
                                    {formatTime(timeLeft)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* === TRÁI: Câu hỏi + đáp án === */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl p-8 h-full min-h-96 flex flex-col">

                                {/* Số câu hiện tại */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-green-700">
                                        Câu {currentIdx + 1}
                                    </h2>
                                    <span className="text-lg text-gray-600">
                                        Đã làm: {answeredCount}/{questions.length}
                                    </span>
                                </div>

                                {/* Nội dung câu hỏi */}
                                <p className="text-lg md:text-xl font-medium text-gray-800 mb-8 leading-relaxed">
                                    {q.content}
                                </p>

                                {/* Đáp án */}
                                <div className="space-y-4 flex-1">
                                    {q.options.map(opt => {
                                        const selected = answers[q.questionId] === opt.answerId;
                                        return (
                                            <button
                                                key={opt.answerId}
                                                onClick={() => selectAnswer(q.questionId, opt.answerId)}
                                                className={`w-full text-left p-5 rounded-xl border-2 text-lg transition-all
                                                    ${selected
                                                    ? 'border-green-600 bg-green-50 font-bold shadow-md'
                                                    : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {opt.content}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* === PHẢI: Bảng số câu === */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Danh sách câu hỏi</h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {questions.map((_, i) => {
                                        const answered = answers[questions[i].questionId];
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => goToQuestion(i)}
                                                className={`w-12 h-12 rounded-lg font-bold text-lg transition-all
                                                    ${i === currentIdx
                                                    ? 'bg-green-600 text-white shadow-lg scale-110'
                                                    : answered
                                                        ? 'bg-green-200 text-green-800 hover:bg-green-300'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 text-center">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || answeredCount === 0}
                                        className={`w-full py-5 text-xl font-bold text-white rounded-xl transition shadow-lg
                                            ${answeredCount === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 active:scale-95'
                                        }`}
                                    >
                                        {submitting ? 'Đang nộp...' : 'Nộp bài'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default QuizTakingPage;
