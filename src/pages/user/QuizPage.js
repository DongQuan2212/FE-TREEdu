import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";

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
        if (searchTerm.trim().length < 2) {
            fetchQuizzes();
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            fetchQuizzes();
        }, 400);
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            let url = '/quiz?size=100';
            if (searchTerm.trim().length >= 2) {
                url = `/quiz/search?title=${encodeURIComponent(searchTerm.trim())}`;
            }
            const response = await axiosInstance.get(url);
            if (response.data.success) {
                const result = response.data.data;
                if (Array.isArray(result)) {
                    setQuizzes(result);
                } else if (result && result.content) {
                    setQuizzes(result.content);
                } else {
                    setQuizzes([]);
                }
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

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesLevel = selectedLevel === 'all' || quiz.level === Number(selectedLevel);
        const matchesTopic = selectedTopic === 'all' || quiz.topic === selectedTopic;
        return matchesLevel && matchesTopic;
    });

    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
        switch (sortBy) {
            case 'title': return a.title.localeCompare(b.title);
            case 'level': return a.level - b.level;
            case 'timer': return a.timer - b.timer;
            case 'questionCount': return a.questionCount - b.questionCount;
            default: return 0;
        }
    });

    // Lấy danh sách topics duy nhất từ data
    const uniqueTopics = [...new Set(quizzes.map(q => q.topic))].filter(Boolean);

    // Tính stats
    const uniqueLevels = [...new Set(quizzes.map(q => q.level))].length;
    const avgTimer = quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, q) => sum + q.timer, 0) / quizzes.length)
        : 0;

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

    // --- Loading State ---
    if (loading && quizzes.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-44 bg-white border border-zinc-200 rounded-2xl mb-8 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

                    {/* ── Hero Card ── */}
                    <div className="bg-white border border-zinc-200 rounded-2xl px-7 pt-7 pb-6 mb-8">

                        {/* Title row */}
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
                                    Thư viện Quiz
                                </h1>
                                <p className="text-zinc-500 text-sm font-light mt-1.5">
                                    Rèn luyện kiến thức với các bài kiểm tra đa chủ đề
                                </p>
                            </div>
                            {/* Badge đếm tổng số bài */}
                            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                {quizzes.length} bài có sẵn
                            </span>
                        </div>

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span><strong className="text-zinc-800">{uniqueLevels}</strong> cấp độ</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span><strong className="text-zinc-800">{uniqueTopics.length}</strong> chủ đề</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <img src={iconTime} alt="" className="w-3.5 h-3.5 grayscale opacity-50" />
                                <span>Trung bình <strong className="text-zinc-800">{avgTimer} phút</strong> mỗi bài</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <img src={iconQuestion} alt="" className="w-3.5 h-3.5 grayscale opacity-50" />
                                <span>10 – 15 câu mỗi bài</span>
                            </div>
                        </div>

                        {/* Topic chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100">
                            <span className="text-xs text-zinc-400 font-medium mr-1">Chủ đề:</span>
                            <button
                                onClick={() => setSelectedTopic('all')}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                    selectedTopic === 'all'
                                        ? 'bg-zinc-900 text-white border-zinc-900'
                                        : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400'
                                }`}
                            >
                                Tất cả
                            </button>
                            {uniqueTopics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        selectedTopic === topic
                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                            : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400'
                                    }`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Filter Bar ── */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        {/* Search */}
                        <div className="flex-grow sm:max-w-sm relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài quiz..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors"
                            />
                            {loading && quizzes.length > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Level + Sort */}
                        <div className="flex gap-3">
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {[1, 2, 3, 4, 5, 6].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                            >
                                <option value="title">Tên A → Z</option>
                                <option value="level">Cấp độ tăng dần</option>
                                <option value="timer">Thời gian</option>
                                <option value="questionCount">Số câu hỏi</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Section label ── */}
                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-4">
                        {sortedQuizzes.length} kết quả
                        {selectedTopic !== 'all' && <span className="ml-1 normal-case">trong "{selectedTopic}"</span>}
                        {selectedLevel !== 'all' && <span className="ml-1 normal-case">· Level {selectedLevel}</span>}
                    </p>

                    {/* ── Quiz Grid ── */}
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
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded text-xs text-zinc-600 font-medium">
                                                <img src={iconTopic} alt="" className="w-3 h-3 grayscale opacity-70" />
                                                <span className="truncate max-w-[100px]">{quiz.topic}</span>
                                            </div>
                                            <span className={getLevelBadge(quiz.level)}>
                                                LVL {quiz.level}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-zinc-900 mb-2 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                            {quiz.title}
                                        </h3>

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
