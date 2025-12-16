import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from "../../config/api";
import { Eye, Clock, CheckCircle, Calendar } from "lucide-react";

function FlashcardHistoryPage() {
    const navigate = useNavigate();
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchHistories();
    }, []);

    const fetchHistories = async () => {
        try {
            setLoading(true);
            const response = await flashcardAPI.getLearnHistory();
            if (response.data.status === 200) {
                setHistories(response.data.data);
            }
        } catch (err) {
            console.error("Fetch history error:", err);
            setError("Không thể tải lịch sử học");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Chưa có";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadge = (status) => {
        if (status === "DONE") {
            return (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Hoàn thành
                </span>
            );
        }
        return (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Đang học
            </span>
        );
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <p className="text-xl text-red-600">{error}</p>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate("/flashcard/me")}
                            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition mb-4"
                        >
                            ← Quay lại
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Lịch sử học tập</h1>
                        <p className="text-gray-600 mt-2">Xem lại tiến độ học của bạn</p>
                    </div>

                    {/* History List */}
                    {histories.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                            <p className="text-xl text-gray-600">Bạn chưa học flashcard nào</p>
                            <button
                                onClick={() => navigate("/flashcard/me")}
                                className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                Bắt đầu học ngay
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {histories.map((history) => (
                                <div
                                    key={history.id}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                        {/* Left: Info */}
                                        <div className="lg:col-span-8 space-y-4">

                                            {/* Title & Status */}
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {history.flashcardTitle}
                                                </h3>
                                                {getStatusBadge(history.status)}
                                            </div>

                                            {/* Progress */}
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                    <span>Tiến độ</span>
                                                    <span className="font-semibold">
                                                        {history.viewedWordCount}/{history.totalWords} từ ({Math.round(history.progressPercentage)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all ${
                                                            history.status === "DONE"
                                                                ? "bg-green-500"
                                                                : "bg-yellow-500"
                                                        }`}
                                                        style={{ width: `${history.progressPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Time Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <div>
                                                        <span className="font-medium">Bắt đầu:</span>{" "}
                                                        {formatDateTime(history.startedAt)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <div>
                                                        <span className="font-medium">Hoàn thành:</span>{" "}
                                                        {formatDateTime(history.completedAt)}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Right: Action */}
                                        <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
                                            <button
                                                onClick={() => navigate(`/flashcard/detail/${history.flashcardId}`)}
                                                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Xem chi tiết
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </>
    );
}

export default FlashcardHistoryPage;
