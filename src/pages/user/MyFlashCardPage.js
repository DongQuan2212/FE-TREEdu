import React, { useState, useEffect } from 'react';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import { flashcardAPI } from '../../config/api';

import iconbook from "../../asset/User/book.png";
import iconadd from "../../asset/User/plus.png";
import iconDictionary from "../../asset/User/dictionary.png";

// ============================================
// SUBCOMPONENTS - Clean & Reusable
// ============================================

const LoadingSkeleton = () => (
    <>
        <Header />
        <main className="min-h-screen bg-neutral-50 pt-32 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header skeleton */}
                <div className="mb-12 pb-6 border-b border-neutral-200">
                    <div className="h-10 bg-neutral-200 rounded-lg w-56 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-neutral-100 rounded w-80 animate-pulse"></div>
                </div>

                {/* Grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-xl border border-neutral-200 animate-pulse"></div>
                    ))}
                </div>
            </div>
        </main>
        <Footer />
    </>
);

const ErrorState = ({ message, onRetry }) => (
    <>
        <Header />
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-neutral-600 mb-6 text-sm">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        </main>
        <Footer />
    </>
);

const CreateNewCard = ({ onClick }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center p-8 min-h-[260px] bg-white border-2 border-dashed border-neutral-200 rounded-2xl hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        aria-label="Tạo flashcard mới"
    >
        {/* Icon with smooth animation */}
        <div className="relative mb-5">
            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:scale-110 transition-all duration-300">
                <img src={iconadd} alt="" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        <h3 className="text-base font-semibold text-neutral-900 mb-2">Tạo bộ flashcard mới</h3>
        <p className="text-sm text-neutral-500 text-center max-w-[200px] leading-relaxed">
            Bắt đầu xây dựng bộ từ vựng của riêng bạn
        </p>

        {/* Subtle hover indicator */}
        <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </div>
    </button>
);

const FlashcardItem = ({ flashcard, onNavigate }) => {
    const handleClick = (e) => {
        e.preventDefault();
        onNavigate(`/flashcard/detail/${flashcard.id}`);
    };

    return (
        <article
            onClick={handleClick}
            className="group relative flex flex-col bg-white p-6 min-h-[160px] rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
        >
            {/* Top Meta Info */}
            <div className="flex items-center justify-between mb-4">
                {flashcard.level && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
                        Lv {flashcard.level}
                    </span>
                )}
                <div className="flex items-center gap-1.5 text-neutral-400">
                    <img src={iconDictionary} alt="" className="w-4 h-4 opacity-60" />
                    <span className="text-xs font-medium">{flashcard.wordCount}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-2.5 leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {flashcard.title}
                </h3>

                <p className="text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                   Mô tả : {flashcard.description || "Chưa có mô tả"}
                </p>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <button
                    onClick={handleClick}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-emerald-600 transition-colors group/btn"
                    aria-label={`Xem chi tiết ${flashcard.title}`}
                >
                    <span>Xem chi tiết</span>
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Quick action hint */}
                <div className="w-9 h-9 rounded-full bg-neutral-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                </div>
            </div>

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/30 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </article>
    );
};

const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-neutral-200 rounded-full blur-2xl opacity-30"></div>
            <img src={iconbook} alt="" className="relative w-20 h-20 grayscale opacity-20" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Chưa có flashcard nào</h3>
        <p className="text-neutral-500 text-sm max-w-md">
            Bắt đầu tạo bộ flashcard đầu tiên để bắt đầu hành trình học tập của bạn
        </p>
    </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

function MyFlashCardPage() {
    const navigate = useNavigate();
    const [myFlashcards, setMyFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const fetchFlashcards = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await flashcardAPI.getAllFlashcards();

            if (response.data.status === 200) {
                setMyFlashcards(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching flashcards:', err);
            setError('Không thể tải danh sách flashcards. Vui lòng kiểm tra kết nối và thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewFlashcard = () => navigate('/flashcard/create');
    const handleGoToMyLists = () => navigate('/flashcard/me');

    // ============================================
    // RENDER STATES
    // ============================================

    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorState message={error} onRetry={fetchFlashcards} />;

    return (
        <>
            <Header />

            <main className="min-h-screen bg-neutral-50 pt-28 pb-24 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto mt-8">

                    {/* Page Header - Clean & Modern */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-neutral-200">
                        <div className="mb-10 md:mb-0">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-5">
                                Thư viện của tôi
                            </h1>
                            <p className="text-neutral-500 text-base leading-relaxed max-w-xl">
                                Quản lý và theo dõi tiến độ học tập từ vựng của bạn.
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleGoToMyLists}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span>Danh sách đã tạo</span>
                        </button>
                    </header>

                    {/* Grid Layout - Responsive & Balanced */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {/* Create New Card - Always first */}
                        <CreateNewCard onClick={handleCreateNewFlashcard} />

                        {/* Flashcards or Empty State */}
                        {myFlashcards.length === 0 ? (
                            <EmptyState />
                        ) : (
                            myFlashcards.map((flashcard) => (
                                <FlashcardItem
                                    key={flashcard.id}
                                    flashcard={flashcard}
                                    onNavigate={navigate}
                                />
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
