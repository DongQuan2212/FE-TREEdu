import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';
import { Globe, Lock, Search, ArrowRight, Flag, Plus } from 'lucide-react';

import iconbook from "../../asset/User/book.png";
import iconDictionary from "../../asset/User/dictionary.png";

function MyFlashCardPage() {
const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [searchResults, setSearchResults] = useState(null); // null = chưa search, [] = không có kết quả
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportModal, setReportModal] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const debounceRef = useRef(null);
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedVisibility, setSelectedVisibility] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

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

    // const filteredFlashcards = flashcards.filter(card => {
    //     const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()));
    //     const matchesLevel = selectedLevel === 'all' || card.level === Number(selectedLevel);
    //     const matchesTopic = selectedTopic === 'all' || card.topic === selectedTopic;
    //     const matchesType = selectedType === 'all' || card.type === selectedType;
    //     const matchesVisibility = selectedVisibility === 'all' || card.visibility === selectedVisibility;
    //     return matchesSearch && matchesLevel && matchesTopic && matchesType && matchesVisibility;
    // });

    // ── Debounce search gọi API ──
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Xóa timer cũ
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            // Xóa hết → quay về danh sách gốc
            setSearchResults(null);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const response = await flashcardAPI.searchFlashcards(value.trim());
                if (response.data.status === 200) {
                    setSearchResults(response.data.data);
                }
            } catch (err) {
                console.error('Lỗi tìm kiếm:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400); // debounce 400ms
    };

    // ── Nguồn dữ liệu: nếu đang search thì dùng searchResults, không thì dùng flashcards ──
    const baseList = searchResults !== null ? searchResults : flashcards;

    const filteredFlashcards = baseList.filter(card => {
        const matchesLevel = selectedLevel === 'all' || card.level === Number(selectedLevel);
        const matchesTopic = selectedTopic === 'all' || card.topic === selectedTopic;
        const matchesType = selectedType === 'all' || card.type === selectedType;
        const matchesVisibility = selectedVisibility === 'all' || card.visibility === selectedVisibility;
        return matchesLevel && matchesTopic && matchesType && matchesVisibility;
        // Bỏ matchesSearch vì đã để BE xử lý
    });

    const sortedFlashcards = [...filteredFlashcards].sort((a, b) => {
        switch (sortBy) {
            case 'title': return a.title.localeCompare(b.title);
            case 'level': return a.level - b.level;
            case 'wordCount': return b.wordCount - a.wordCount;
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            default: return 0;
        }
    });

    // Stats tính động
    const uniqueTopics = [...new Set(flashcards.map(f => f.topic).filter(Boolean))];
    const totalWords = flashcards.reduce((sum, f) => sum + (f.wordCount || 0), 0);
    const systemCount = flashcards.filter(f => f.type === 'SYSTEM').length;
    const memberCount = flashcards.filter(f => f.type === 'BY_MEMBER').length;

    const handleDetail = (id) => navigate(`/flashcard/detail/${id}`);
    const handleCreate = () => navigate('/flashcard/create');

    const handleOpenReport = (e, flashcard) => {
        e.stopPropagation();
        setSelectedFlashcard(flashcard);
        setReportReason('');
        setReportModal(true);
    };

    const handleSubmitReport = async () => {
        if (!reportReason.trim()) {
            alert("Vui lòng nhập lý do báo cáo");
            return;
        }
        try {
            setReportLoading(true);
            await flashcardAPI.reportFlashcard(selectedFlashcard.id, { reason: reportReason });
            alert("Báo cáo flashcard thành công");
            setReportModal(false);
            setSelectedFlashcard(null);
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Không thể báo cáo flashcard");
        } finally {
            setReportLoading(false);
        }
    };

    const getLevelBadge = (level) => {
        const style = {
            1: 'border-green-200 bg-green-50 text-green-700',
            2: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            3: 'border-yellow-200 bg-yellow-50 text-yellow-700',
            4: 'border-orange-200 bg-orange-50 text-orange-700',
            5: 'border-red-200 bg-red-50 text-red-700',
        }[level] || 'border-zinc-200 bg-zinc-50 text-zinc-600';
        return `px-2 py-0.5 border text-[10px] font-bold rounded ${style}`;
    };

    // --- Loading State ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-52 bg-white border border-zinc-200 rounded-2xl mb-8 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {[1, 2, 3].map(n => <div key={n} className="h-10 bg-gray-100 rounded animate-pulse"></div>)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse"></div>
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
                        <button onClick={fetchFlashcards} className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition text-sm font-medium">
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
                                    Thư viện Flashcard
                                </h1>
                                <p className="text-zinc-500 text-sm font-light mt-1.5">
                                    Khám phá và học từ vựng qua các bộ thẻ đa dạng
                                </p>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="shrink-0 flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo bộ thẻ
                            </button>
                        </div>

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span><strong className="text-zinc-800">{flashcards.length}</strong> bộ thẻ</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span><strong className="text-zinc-800">{uniqueTopics.length}</strong> chủ đề</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <img src={iconDictionary} alt="" className="w-3.5 h-3.5 opacity-50" />
                                <span><strong className="text-zinc-800">{totalWords.toLocaleString()}</strong> từ vựng</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-700 font-medium">
                                <span>{systemCount} hệ thống</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-xs text-purple-700 font-medium">
                                <span>{memberCount} thành viên</span>
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Tìm tên bộ thẻ, mô tả..."
                                value={searchTerm}
                                onChange={handleSearchChange}  
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors"
                            />
                            {/* Loading spinner khi đang gọi API search */}
                            {searchLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                            )}
                        </div>

                        {/* Dropdowns */}
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={selectedVisibility}
                                onChange={(e) => setSelectedVisibility(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                            >
                                <option value="all">Mọi chế độ</option>
                                <option value="PUBLIC">Công khai</option>
                                <option value="PRIVATE">Riêng tư</option>
                            </select>

                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                            >
                                <option value="all">Mọi loại thẻ</option>
                                <option value="SYSTEM">Hệ thống</option>
                                <option value="BY_MEMBER">Thành viên</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-800 appearance-none cursor-pointer"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="title">Tên A → Z</option>
                                <option value="wordCount">Số từ nhiều nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Section label ── */}
                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-4">
                        {sortedFlashcards.length} kết quả
                        {selectedTopic !== 'all' && <span className="ml-1 normal-case">trong "{selectedTopic}"</span>}
                        {selectedVisibility !== 'all' && (
                            <span className="ml-1 normal-case">
                                · {selectedVisibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                            </span>
                        )}
                        {selectedType !== 'all' && (
                            <span className="ml-1 normal-case">
                                · {selectedType === 'SYSTEM' ? 'Hệ thống' : 'Thành viên'}
                            </span>
                        )}
                    </p>

                    {/* ── Grid Content ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedFlashcards.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-400">
                                <img src={iconbook} alt="Empty" className="w-16 grayscale opacity-20 mb-4" />
                                <p className="text-sm font-medium">Không tìm thấy bộ thẻ phù hợp.</p>
                            </div>
                        ) : (
                            sortedFlashcards.map((flashcard) => (
                                <div
                                    key={flashcard.id}
                                    onClick={() => handleDetail(flashcard.id)}
                                    className="group relative bg-white rounded-2xl border border-zinc-200 p-6 cursor-pointer hover:border-zinc-900 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[260px]"
                                >
                                    {/* Badges Row */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                                                flashcard.type === 'SYSTEM'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-purple-50 text-purple-700 border-purple-100'
                                            }`}>
                                                {flashcard.type === 'SYSTEM' ? 'Hệ thống' : 'Thành viên'}
                                            </span>
                                            <span className={getLevelBadge(flashcard.level)}>
                                                LV {flashcard.level}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!flashcard.isOwner && (
                                                <button
                                                    onClick={(e) => handleOpenReport(e, flashcard)}
                                                    className="transition-all"
                                                    title="Báo cáo flashcard"
                                                >
                                                    <Flag className="w-4 h-4 text-zinc-400 hover:text-red-500 transition-colors" />
                                                </button>
                                            )}
                                            <div title={flashcard.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}>
                                                {flashcard.visibility === 'PUBLIC' ? (
                                                    <Globe className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                                                ) : (
                                                    <Lock className="w-4 h-4 text-amber-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-zinc-900 mb-2 leading-tight line-clamp-2 group-hover:text-zinc-800">
                                            {flashcard.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                {flashcard.topic || 'General'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 line-clamp-2 italic">
                                            {flashcard.description || "Không có mô tả cho bộ thẻ này."}
                                        </p>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-600">
                                            <img src={iconDictionary} alt="" className="w-4 h-4 opacity-70" />
                                            <span className="text-xs font-bold">{flashcard.wordCount} thẻ</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
                                            Chi tiết <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>

                                    {/* Shared badge */}
                                    {!flashcard.isOwner && flashcard.type === 'BY_MEMBER' && (
                                        <div className="absolute -top-2 -right-2 bg-white shadow-sm border border-zinc-100 rounded-full px-2 py-1 flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-[9px] font-medium text-zinc-500">Shared</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* ── Report Modal ── */}
            {reportModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-zinc-900 mb-2">Báo cáo flashcard</h2>
                        <p className="text-sm text-zinc-500 mb-4">
                            Flashcard: <span className="font-semibold ml-1">{selectedFlashcard?.title}</span>
                        </p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Nhập lý do báo cáo..."
                            className="w-full min-h-[120px] border border-zinc-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                        />
                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setReportModal(false)}
                                className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium hover:bg-zinc-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitReport}
                                disabled={reportLoading}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {reportLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default MyFlashCardPage;
