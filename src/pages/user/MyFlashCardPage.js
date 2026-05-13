import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';
import {
    Globe,
    Lock,
    Search,
    Filter,
    ArrowRight,
    Flag
} from 'lucide-react';

import iconbook from "../../asset/User/book.png";
import iconadd from "../../asset/User/plus.png";
import iconDictionary from "../../asset/User/dictionary.png";

function MyFlashCardPage() {
    const navigate = useNavigate();
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportModal, setReportModal] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedVisibility, setSelectedVisibility] = useState('all'); // Thêm state visibility
    const [sortBy, setSortBy] = useState('newest'); // Mặc định mới nhất lên đầu

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
        const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLevel = selectedLevel === 'all' || card.level === Number(selectedLevel);
        const matchesTopic = selectedTopic === 'all' || card.topic === selectedTopic;
        const matchesType = selectedType === 'all' || card.type === selectedType;
        // Logic lọc visibility: Card System luôn là PUBLIC nên vẫn thoả mãn nếu chọn 'all' hoặc 'PUBLIC'
        const matchesVisibility = selectedVisibility === 'all' || card.visibility === selectedVisibility;

        return matchesSearch && matchesLevel && matchesTopic && matchesType && matchesVisibility;
    });

    // --- Logic Sắp xếp (Sort) ---
    const sortedFlashcards = [...filteredFlashcards].sort((a, b) => {
        switch (sortBy) {
            case 'title': return a.title.localeCompare(b.title);
            case 'level': return a.level - b.level;
            case 'wordCount': return b.wordCount - a.wordCount;
            case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
            default: return 0;
        }
    });

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

            await flashcardAPI.reportFlashcard(
                selectedFlashcard.id,
                {
                    reason: reportReason
                }
            );

            alert("Báo cáo flashcard thành công");

            setReportModal(false);
            setSelectedFlashcard(null);

        } catch (error) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Không thể báo cáo flashcard"
            );
        } finally {
            setReportLoading(false);
        }
    };
    // --- Helper Badge Styles ---
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

    // --- Loading & Error States (Giữ nguyên như cũ) ---
    if (loading) return (/* Skeleton UI của bạn */ <div className="p-20 text-center">Đang tải...</div>);
    if (error) return (<div className="p-20 text-center">{error}</div>);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto mt-8">

                    {/* Header Section */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-2">Thư viện Flashcard</h1>
                            <p className="text-zinc-500 font-light">Khám phá và quản lý kiến thức của bạn qua {sortedFlashcards.length} bộ thẻ.</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-black transition-all shadow-sm font-medium text-sm w-fit"
                        >
                            <img src={iconadd} alt="" className="w-4 h-4 invert" />
                            Tạo bộ thẻ mới
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-10 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm tên bộ thẻ, mô tả..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-800 transition-all"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="filter-select">
                                    <option value="all">Mọi chủ đề</option>
                                    {[...new Set(flashcards.map(f => f.topic).filter(Boolean))].map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>

                                <select value={selectedVisibility} onChange={(e) => setSelectedVisibility(e.target.value)} className="filter-select font-medium text-zinc-900">
                                    <option value="all">Mọi chế độ</option>
                                    <option value="PUBLIC">🌍 Công khai</option>
                                    <option value="PRIVATE">🔒 Riêng tư</option>
                                </select>

                                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
                                    <option value="all">Mọi loại thẻ</option>
                                    <option value="SYSTEM">Hệ thống</option>
                                    <option value="BY_MEMBER">Thành viên</option>
                                </select>

                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                                    <option value="newest">Mới nhất</option>
                                    <option value="title">Tên A-Z</option>
                                    <option value="wordCount">Số từ</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid Content */}
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
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                                                    flashcard.type === 'SYSTEM'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : 'bg-purple-50 text-purple-700 border-purple-100'
                                                }`}>
                                                {flashcard.type === 'SYSTEM' ? 'Hệ thống' : 'Thành viên'}
                                            </span>
                                            <span className={getLevelBadge(flashcard.level)}>
                                                LVL {flashcard.level}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">

                                            {/* REPORT */}
                                            {!flashcard.isOwner && (
                                                <button
                                                    onClick={(e) => handleOpenReport(e, flashcard)}
                                                    className="transition-all"
                                                    title="Báo cáo flashcard"
                                                >
                                                    <Flag
                                                        className="w-4 h-4 text-zinc-400 hover:text-red-500 transition-colors"/>
                                                </button>
                                            )}

                                            {/* VISIBILITY */}
                                            <div title={flashcard.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}>
                                                {flashcard.visibility === 'PUBLIC' ? (
                                                    <Globe
                                                        className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors"/>
                                                ) : (
                                                    <Lock className="w-4 h-4 text-amber-500"/>
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
                                            <span
                                                className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{flashcard.topic || 'General'}</span>
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

                                    {/* Chủ sở hữu (Nếu là của Member khác) */}
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
            {/* REPORT MODAL */}
            {reportModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">

                        <h2 className="text-xl font-bold text-zinc-900 mb-2">
                            Báo cáo flashcard
                        </h2>

                        <p className="text-sm text-zinc-500 mb-4">
                            Flashcard:
                            <span className="font-semibold ml-1">
                    {selectedFlashcard?.title}
                </span>
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
                                {reportLoading
                                    ? 'Đang gửi...'
                                    : 'Gửi báo cáo'}
                            </button>

                        </div>
                    </div>
                </div>
            )}
            <Footer />

            {/* CSS inline cho select để đồng bộ UI */}
            <style jsx>{`
                .filter-select {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    background-color: #f9f9fb;
                    border: 1px solid #e4e4e7;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    color: #3f3f46;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-select:focus {
                    border-color: #18181b;
                    background-color: #fff;
                }
            `}</style>
        </>
    );
}

export default MyFlashCardPage;
