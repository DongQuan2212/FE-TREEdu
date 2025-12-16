import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
// import axios from 'axios'; // Không dùng nên có thể bỏ
import axiosInstance from '../../config/axiosConfig';

import iconTime from "../../asset/User/time.png";
import iconQuestion from "../../asset/User/question.png";
import iconTopic from "../../asset/User/topic.png";
import iconQuizEmpty from "../../asset/User/book.png";

function QuizPage() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [sortBy, setSortBy] = useState('title');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/quiz');
            if (response.data.success) {
                setQuizzes(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Lỗi tải quiz:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
                return;
            }
            setError('Không thể tải danh sách bài quiz. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Lọc + Tìm kiếm
    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === 'all' || quiz.level === Number(selectedLevel);
        const matchesTopic = selectedTopic === 'all' || quiz.topic === selectedTopic;
        return matchesSearch && matchesLevel && matchesTopic;
    });

    // Sắp xếp
    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
        switch (sortBy) {
            case 'title': return a.title.localeCompare(b.title);
            case 'level': return a.level - b.level;
            case 'timer': return a.timer - b.timer;
            case 'questionCount': return a.questionCount - b.questionCount;
            default: return 0;
        }
    });

    // Style Badge tối giản hơn (Border + Light BG)
    const getLevelBadge = (level) => {
        const style = {
            1: 'border-green-200 bg-green-50 text-green-700',
            2: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            3: 'border-yellow-200 bg-yellow-50 text-yellow-700',
            4: 'border-orange-200 bg-orange-50 text-orange-700',
            5: 'border-red-200 bg-red-50 text-red-700',
            6: 'border-purple-200 bg-purple-50 text-purple-700',
        }[level] || 'border-zinc-200 bg-zinc-50 text-zinc-600';

        return `px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-md ${style}`;
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
    };

    // --- Loading State: Minimalist Skeleton ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-10 bg-gray-200 rounded w-48 mb-12 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
                            <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
                            <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
                            <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="h-56 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-zinc-800 font-medium mb-4">{error}</p>
                        <button
                            onClick={fetchQuizzes}
                            className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition text-sm font-medium"
                        >
                            Thử lại
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto mt-8">

                    {/* Header Section */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-5">
                            Thư viện Quiz
                        </h1>
                        <p className="text-zinc-500 font-light">
                        Rèn luyện kiến thức với {sortedQuizzes.length} bài kiểm tra có sẵn.
                        </p>
                    </div>

                    {/* Filter Bar - Modern & Clean */}
                    <div className="flex flex-col xl:flex-row gap-4 mb-10 pb-6 border-b border-zinc-200">
                        {/* Search Input */}
                        <div className="flex-grow xl:max-w-md relative group">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài quiz..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors"
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow xl:flex-grow-0">
                            <div className="relative">
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="all">Tất cả cấp độ</option>
                                    {[1,2,3,4,5,6].map(l => (
                                        <option key={l} value={l}>Level {l}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="all">Tất cả chủ đề</option>
                                    {[...new Set(quizzes.map(q => q.topic))].map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="title">Tên A → Z</option>
                                    <option value="level">Cấp độ tăng dần</option>
                                    <option value="timer">Thời gian</option>
                                    <option value="questionCount">Số câu hỏi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedQuizzes.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-400">
                                <img src={iconQuizEmpty} alt="Empty" className="w-16 grayscale opacity-20 mb-4" />
                                <p className="text-sm font-medium">Không tìm thấy bài quiz phù hợp.</p>
                            </div>
                        ) : (
                            sortedQuizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    onClick={() => handleStartQuiz(quiz.id)}
                                    className="group relative bg-white rounded-xl border border-zinc-200 p-6 cursor-pointer hover:border-zinc-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                >
                                    {/* Top Content */}
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            {/* Topic Tag */}
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded text-xs text-zinc-600 font-medium">
                                                <img src={iconTopic} alt="" className="w-3 h-3 grayscale opacity-70" />
                                                <span className="truncate max-w-[100px]">{quiz.topic}</span>
                                            </div>
                                            {/* Level Badge */}
                                            <span className={getLevelBadge(quiz.level)}>
                                                LVL {quiz.level}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-zinc-900 mb-2 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                            {quiz.title}
                                        </h3>

                                        {/* Metadata Row */}
                                        <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <img src={iconQuestion} alt="" className="w-3.5 h-3.5 grayscale opacity-60" />
                                                <span>{quiz.questionCount} câu</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                                            <div className="flex items-center gap-1.5">
                                                <img src={iconTime} alt="" className="w-3.5 h-3.5 grayscale opacity-60" />
                                                <span>{quiz.timer}p</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bottom */}
                                    <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                            Kiểm tra ngay
                                        </span>
                                        <button className="w-8 h-8 rounded-full bg-zinc-50 group-hover:bg-zinc-900 flex items-center justify-center transition-all duration-300">
                                            <svg className="w-4 h-4 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default QuizPage;
