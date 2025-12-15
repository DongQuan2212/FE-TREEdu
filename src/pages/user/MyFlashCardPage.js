import React, { useState, useEffect } from 'react';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import { flashcardAPI } from '../../config/api';

import iconbook from "../../asset/User/book.png";
import iconadd from "../../asset/User/plus.png";
import iconDictionary from "../../asset/User/dictionary.png";

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
            setError('Không thể tải danh sách flashcards. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartFlashcard = async (flashcardId) => {
        try {
            const response = await flashcardAPI.getFlashcardDetails(flashcardId);
            if (response.data.status === 200) {
                const flashcardDetails = response.data.data;
                if (flashcardDetails.wordCount === 0) {
                    alert('Flashcard này chưa có từ vựng nào. Vui lòng thêm từ trước khi học.');
                    return;
                }
                navigate(`/flashcard/learn/${flashcardId}`, { state: { flashcardDetails } });
            }
        } catch (err) {
            alert('Không thể tải thông tin flashcard.');
        }
    };

    const handleCreateNewFlashcard = () => navigate('/flashcard/create');
    const handleGoToMyLists = () => navigate('/flashcard/me');
    const handleGoToDiscover = () => navigate('/flashcard/discover');

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <div className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
                        </div>
                        <p className="mt-10 text-lg text-gray-600">Đang tải danh sách flashcards...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <p className="text-red-600 text-xl mb-6">{error}</p>
                        <button
                            onClick={fetchFlashcards}
                            className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
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

            <main className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Hero Header */}
                    <div className="text-center mb-12 py-12 px-12 bg-green-800 rounded-2xl shadow-lg text-white">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            Flashcards
                        </h1>
                        <p className="text-xl md:text-2xl opacity-95">
                            Học từ vựng hiệu quả với phương pháp flashcard
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-10">
                        <button
                            onClick={handleGoToMyLists}
                            className="px-10 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition shadow-sm"
                        >
                            List của tôi
                        </button>

                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center md:text-left">
                        Các Flashcard của tôi
                    </h2>

                    {/* Flashcard Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                        {/* Card Tạo mới */}
                        <div
                            onClick={handleCreateNewFlashcard}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-dashed border-green-300 cursor-pointer transition-all hover:-translate-y-2 hover:border-green-500 group"
                        >
                            <div className="p-8 text-center">
                                <div
                                    className="w-16 h-16 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
                                    <img src={iconadd} alt="Tạo mới" className="w-10 h-10"/>
                                </div>
                                <h3 className="text-xl font-semibold text-green-700 mb-3">
                                    Tạo flashcard mới
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Tạo bộ flashcard riêng của bạn để học từ vựng hiệu quả hơn
                                </p>
                                <button
                                    className="mt-2 w-40 py-3 bg-transparent border-2 border-emerald-500 text-emerald-500 rounded-xl font-medium hover:bg-emerald-50 hover:text-black transition shadow-md">
                                    Tạo mới
                                </button>

                            </div>
                        </div>

                        {/* Danh sách flashcard */}
                        {myFlashcards.length === 0 ? (
                            <div className="col-span-full text-center py-10">
                                <img src={iconbook} alt="Chưa có flashcard" className="w-32 mx-auto mb-6 opacity-50" />
                                <p className="text-xl text-gray-500">
                                    Bạn chưa có flashcard nào. Hãy tạo flashcard đầu tiên của bạn!
                                </p>
                            </div>
                        ) : (
                            myFlashcards.map((flashcard) => (
                                <div
                                    key={flashcard.id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all hover:-translate-y-3 border border-gray-100 group"
                                >
                                    <div className="p-8">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                                            {flashcard.title}
                                        </h3>

                                        {flashcard.description && (
                                            <p className="text-gray-600 text-sm mb-5 line-clamp-3">
                                                {flashcard.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <img src={iconDictionary} alt="Từ vựng" className="w-5 h-5" />
                                                <span className="text-gray-700 font-medium">
                                                    {flashcard.wordCount} từ
                                                </span>
                                            </div>
                                            {flashcard.level && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                   Level  {flashcard.level}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => navigate(`/flashcard/detail/${flashcard.id}`)}
                                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                                            >
                                                Chi tiết
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

export default MyFlashCardPage;
