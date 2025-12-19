import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api'; // Giữ lại API config của bạn

import iconbook from "../../asset/User/book.png";
import iconadd from "../../asset/User/plus.png";
import iconDictionary from "../../asset/User/dictionary.png";

function MyFlashCardPage() {
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Filter States (Giống QuizPage) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [selectedType, setSelectedType] = useState('all'); // Flashcard có thêm Type (System/Member)
    const [sortBy, setSortBy] = useState('title');

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setLoading(true);
            const response = await flashcardAPI.getAllFlashcards();
            if (response.data.status === 200) {
                setFlashcards(response.data.data);
            }
        } catch (err) {
            console.error('Lỗi tải flashcard:', err);
            setError('Không thể tải danh sách bộ từ vựng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // --- Logic Lọc (Filter) ---
    const filteredFlashcards = flashcards.filter(card => {
        // 1. Search
        const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()));
        // 2. Level
        const matchesLevel = selectedLevel === 'all' || card.level === Number(selectedLevel);
        // 3. Topic
        const matchesTopic = selectedTopic === 'all' || card.topic === selectedTopic;
        // 4. Type
        const matchesType = selectedType === 'all' || card.type === selectedType;

        return matchesSearch && matchesLevel && matchesTopic && matchesType;
    });

    // --- Logic Sắp xếp (Sort) ---
    const sortedFlashcards = [...filteredFlashcards].sort((a, b) => {
        switch (sortBy) {
            case 'title': return a.title.localeCompare(b.title);
            case 'level': return a.level - b.level;
            case 'wordCount': return b.wordCount - a.wordCount; // Nhiều từ xếp trước
            default: return 0;
        }
    });

    // --- Navigation Handlers ---
    const handleDetail = (id) => navigate(`/flashcard/detail/${id}`);
    const handleCreate = () => navigate('/flashcard/create');

    // --- Helper: Badge Style (Giống QuizPage) ---
    const getLevelBadge = (level) => {
        const style = {
            1: 'border-green-200 bg-green-50 text-green-700',
            2: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            3: 'border-yellow-200 bg-yellow-50 text-yellow-700',
            4: 'border-orange-200 bg-orange-50 text-orange-700',
            5: 'border-red-200 bg-red-50 text-red-700',
        }[level] || 'border-zinc-200 bg-zinc-50 text-zinc-600';

        return `px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-md ${style}`;
    };

    const getTypeBadge = (type) => {
        if (type === 'SYSTEM') return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-purple-50 text-purple-700 border-purple-200';
    };

    // --- Loading Skeleton ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-10 bg-gray-200 rounded w-48 mb-12 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
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
                        <button onClick={fetchFlashcards} className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition text-sm font-medium">Thử lại</button>
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
                            Thư viện Flashcard
                        </h1>
                        <p className="text-zinc-500 font-light">
                            Quản lý {sortedFlashcards.length} bộ thẻ từ vựng của bạn và hệ thống.
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col xl:flex-row gap-4 mb-10 pb-6 border-b border-zinc-200">
                        {/* Search Input */}
                        <div className="flex-grow xl:max-w-md relative group">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bộ thẻ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors"
                            />
                        </div>

                        {/* Dropdowns Container */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow xl:flex-grow-0">
                            {/* Topic Filter */}
                            <div className="relative">
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="all">Tất cả chủ đề</option>
                                    {[...new Set(flashcards.map(f => f.topic).filter(Boolean))].map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Level Filter */}
                            <div className="relative">
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="all">Tất cả Level</option>
                                    {[1, 2, 3, 4, 5].map(l => (
                                        <option key={l} value={l}>Level {l}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="all">Tất cả loại thẻ</option>
                                    <option value="SYSTEM">Hệ thống</option>
                                    <option value="BY_MEMBER">Của tôi</option>
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                                >
                                    <option value="title">Tên A → Z</option>
                                    <option value="level">Level thấp → cao</option>
                                    <option value="wordCount">Số lượng từ</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                        {/* Card: Create New (Chỉ hiện khi không filter System) */}
                        {selectedType !== 'SYSTEM' && (
                            <div
                                onClick={handleCreate}
                                className="group flex flex-col items-center justify-center p-6 min-h-[240px] bg-white border-2 border-dashed border-zinc-300 rounded-xl hover:border-zinc-800 hover:bg-zinc-50 cursor-pointer transition-all duration-300"
                            >
                                <div className="w-14 h-14 mb-4 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <img src={iconadd} alt="" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-base font-bold text-zinc-900">Tạo bộ thẻ mới</h3>
                                <p className="text-xs text-zinc-500 mt-1">Thêm từ vựng của riêng bạn</p>
                            </div>
                        )}

                        {/* List Flashcards */}
                        {sortedFlashcards.length === 0 && selectedType === 'SYSTEM' ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-400">
                                <img src={iconbook} alt="Empty" className="w-16 grayscale opacity-20 mb-4" />
                                <p className="text-sm font-medium">Không tìm thấy bộ flashcard nào.</p>
                            </div>
                        ) : (
                            sortedFlashcards.map((flashcard) => (
                                <div
                                    key={flashcard.id}
                                    onClick={() => handleDetail(flashcard.id)}
                                    className="group relative bg-white rounded-xl border border-zinc-200 p-6 cursor-pointer hover:border-zinc-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[240px]"
                                >
                                    {/* Top Content */}
                                    <div>
                                        <div className="flex justify-between items-start mb-4 gap-2">
                                            <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-md ${getTypeBadge(flashcard.type)}`}>
                                                {flashcard.type === 'SYSTEM' ? 'Hệ thống' : 'Của bạn'}
                                            </span>
                                            <span className={getLevelBadge(flashcard.level)}>
                                                LVL {flashcard.level}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-zinc-900 mb-2 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                            {flashcard.title}
                                        </h3>

                                        {flashcard.topic && (
                                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                                                {flashcard.topic}
                                            </p>
                                        )}

                                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                                            {flashcard.description || "Chưa có mô tả"}
                                        </p>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <img src={iconDictionary} alt="" className="w-3.5 h-3.5 opacity-60" />
                                            <span>{flashcard.wordCount} từ</span>
                                        </div>

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

export default MyFlashCardPage;
