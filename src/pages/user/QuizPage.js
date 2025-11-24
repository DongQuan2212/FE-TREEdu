import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import axios from 'axios';


import iconTime from "../../asset/User/time.png";
import iconQuestion from "../../asset/User/question.png";
import iconTopic from "../../asset/User/topic.png";
import iconQuizEmpty from "../../asset/User/book.png";

const API_URL = process.env.REACT_APP_API_BASE_URL ;

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
            const response = await axios.get(`${API_URL}/quiz`);
            if (response.data.success) {
                setQuizzes(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Lỗi tải quiz:', err);
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

    const getLevelBadge = (level) => {
        const bg = {
            1: 'bg-green-100 text-green-800',
            2: 'bg-emerald-100 text-emerald-800',
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-purple-100 text-purple-800',
        }[level] || 'bg-gray-100 text-gray-800';
        return `px-3 py-1 rounded-full text-xs font-semibold ${bg}`;
    };
    const handleStartQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
    };
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <div className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded w-80 mx-auto mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-96 mx-auto"></div>
                        </div>
                        <p className="mt-10 text-lg text-gray-600">Đang tải danh sách bài quiz...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Error
    if (error) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 pd-100">
                    <div className="max-w-6xl mx-auto text-center py-200">
                        <p className="text-red-600 text-xl mb-6">{error}</p>
                        <button
                            onClick={fetchQuizzes}
                            className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-medium"
                        >
                            Thử lại
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Main render
    return (
        <>
            <Header />

            <main className="min-h-screen bg-gray-50 pt-200 pb-16 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Hero */}
                    <div className="text-center mb-12 py-12 px-8 bg-gradient-to-br from-green-700 to-green-500 rounded-2xl shadow-xl text-white">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            Bài Tập Quiz
                        </h1>
                        <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
                            Kiểm tra kiến thức qua các bài quiz đa dạng chủ đề & cấp độ
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài quiz theo tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-6 py-4 mb-8 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 transition"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cấp độ:</label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                                >
                                    <option value="all">Tất cả cấp độ</option>
                                    {[1,2,3,4,5,6].map(l => (
                                        <option key={l} value={l}>Level {l}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chủ đề:</label>
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                                >
                                    <option value="all">Tất cả chủ đề</option>
                                    {[...new Set(quizzes.map(q => q.topic))].map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Sắp xếp:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                                >
                                    <option value="title">Tên A → Z</option>
                                    <option value="level">Cấp độ tăng dần</option>
                                    <option value="timer">Thời gian</option>
                                    <option value="questionCount">Số câu hỏi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Kết quả */}
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Tất cả bài quiz
                        </h2>
                        <p className="text-lg text-gray-600">
                            Tìm thấy <span className="font-bold text-green-600">{sortedQuizzes.length}</span> bài
                        </p>
                    </div>
                    {/* Grid Quiz */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {sortedQuizzes.length === 0 ? (
                            <div className="col-span-full text-center py-16">
                                <img src={iconQuizEmpty} alt="Chưa có quiz" className="w-32 mx-auto mb-6 opacity-50" />
                                <p className="text-xl text-gray-500">
                                    Không tìm thấy bài quiz nào phù hợp.
                                </p>
                            </div>
                        ) : (
                            sortedQuizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all hover:-translate-y-3 border border-gray-100 group cursor-pointer"
                                    onClick={() => handleStartQuiz(quiz.id)}
                                >
                                    <div className="p-8">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
                                            {quiz.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-3 mb-6">
                                            <div className="flex items-center gap-2">
                                                <img src={iconTopic} alt="Chủ đề" className="w-5 h-5" />
                                                <span className="text-gray-600 text-sm">{quiz.topic}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src={iconQuestion} alt="Câu hỏi" className="w-5 h-5" />
                                                <span className="text-gray-600 text-sm">{quiz.questionCount} câu</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src={iconTime} alt="Thời gian" className="w-5 h-5" />
                                                <span className="text-gray-600 text-sm">{quiz.timer} phút</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={getLevelBadge(quiz.level)}>
                                                Level {quiz.level}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartQuiz(quiz.id);
                                                }}
                                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
                                            >
                                                Bắt đầu
                                            </button>
                                        </div>
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
