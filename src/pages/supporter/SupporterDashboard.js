// src/pages/supporter/SupporterDashboard.js
import React, { useState, useEffect } from 'react';
import { BookOpen, CreditCard, Plus, Loader2 } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';

const SupporterDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalQuizzes: 0,
        totalFlashcards: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [quizRes, flashcardRes] = await Promise.all([
                    fetch('http://localhost:3001/quiz'),      // hoặc /quiz nếu bạn dùng vậy
                    fetch('http://localhost:3001/flashcards')
                ]);

                const quizData = await quizRes.json();
                const flashcardData = await flashcardRes.json();

                // FIX CHÍNH ĐÂY – data nằm trong data.content
                const totalQuizzes = quizData.success && quizData.data?.content
                    ? quizData.data.content.length
                    : 0;

                // Nếu backend có trả về totalElements thì dùng luôn (chính xác hơn)
                const totalQuizzesAccurate = quizData.data?.totalElements || totalQuizzes;

                const totalFlashcards = flashcardData.success && flashcardData.data
                    ? flashcardData.data.length
                    : 0;

                setStats({
                    totalQuizzes: totalQuizzesAccurate,
                    totalFlashcards,
                });
            } catch (err) {
                console.error('Lỗi tải thống kê:', err);
                setStats({ totalQuizzes: 0, totalFlashcards: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <SupporterSidebar />
                <div className="flex-1 ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại!</h1>
                                <p className="text-gray-600 mt-2">
                                    Bạn đã tạo <strong>{stats.totalQuizzes} Quiz</strong> và <strong>{stats.totalFlashcards} Flashcard</strong>
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                S
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto">
                    {/* 2 Cards siêu tối giản */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-blue-100 rounded-2xl">
                                    <BookOpen className="w-10 h-10 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-5xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                            <p className="text-lg text-gray-600 mt-3">Quiz đã tạo</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 bg-purple-100 rounded-2xl">
                                    <CreditCard className="w-10 h-10 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-5xl font-bold text-gray-900">{stats.totalFlashcards}</p>
                            <p className="text-lg text-gray-600 mt-3">Flashcard đã tạo</p>
                        </div>
                    </div>

                    {/* Nút hành động nhanh */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <button
                            onClick={() => navigate('/supporter/quizzes/create')}
                            className="group bg-white rounded-2xl border border-gray-200 p-10 text-left hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-200 transition">
                                        <BookOpen className="w-9 h-9 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Tạo Quiz mới</h3>
                                    <p className="text-gray-600">Trắc nghiệm, điền từ, nghe hiểu...</p>
                                </div>
                                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition" />
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/supporter/flashcards')}
                            className="group bg-white rounded-2xl border border-gray-200 p-10 text-left hover:border-purple-500 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-200 transition">
                                        <CreditCard className="w-9 h-9 text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Tạo Flashcard mới</h3>
                                    <p className="text-gray-600">Thẻ từ vựng, hình ảnh, âm thanh...</p>
                                </div>
                                <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition" />
                            </div>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SupporterDashboard;
