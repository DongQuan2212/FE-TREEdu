import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from "../../config/api";
import {
    Eye, Clock, CheckCircle, ArrowLeft,
    Zap, BookOpen, BarChart2, Calendar
} from "lucide-react";

const FlashcardHistoryPage = () => {
    const navigate = useNavigate();
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Tính toán thống kê nhanh cho Dashboard
    const stats = {
        total: histories.length,
        completed: histories.filter(h => h.status === 'DONE').length,
        avgProgress: histories.length > 0
            ? Math.round(histories.reduce((acc, curr) => acc + curr.progressPercentage, 0) / histories.length)
            : 0
    };

    useEffect(() => {
        const fetchHistories = async () => {
            try {
                setLoading(true);
                const response = await flashcardAPI.getLearnHistory();
                if (response.data.status === 200) {
                    // Sắp xếp: Mới nhất lên đầu
                    const sortedHistories = (response.data.data || []).sort((a, b) =>
                        new Date(b.startedAt) - new Date(a.startedAt)
                    );
                    setHistories(sortedHistories);
                }
            } catch (err) {
                console.error("Fetch history error:", err);
                setError("Không thể tải lịch sử học.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistories();
    }, []);

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    // --- Loading State (Giống QuizPage) ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="h-32 bg-gray-200 rounded-xl animate-pulse mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
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
                <main className="min-h-screen bg-zinc-50 flex items-center justify-center pt-20">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="underline text-zinc-800">Tải lại trang</button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <Header />

            <main className="flex-1 pt-28 pb-20 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto mt-8">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-5xl font-bold text-zinc-900 tracking-tight">Lịch sử học từ vựng</h1>
                            <p className="text-zinc-500 mt-1">Theo dõi tiến độ học Flashcard của bạn.</p>
                        </div>
                        <button
                            onClick={() => navigate("/flashcard/me")}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all text-sm font-medium shadow-sm"
                        >
                            <ArrowLeft size={16} />
                            Thư viện Flashcard
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Đang học</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Đã hoàn thành</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.completed}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Tiến độ trung bình</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.avgProgress}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        {histories.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Zap className="text-zinc-400" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 mb-2">Chưa có lịch sử học</h3>
                                <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Bạn chưa học bộ Flashcard nào. Hãy bắt đầu ngay!</p>
                                <button
                                    onClick={() => navigate('/flashcard/me')}
                                    className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
                                >
                                    Học ngay
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Tên bộ Flashcard</th>
                                        <th className="px-6 py-4 font-semibold w-1/4">Tiến độ</th>
                                        <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                                        <th className="px-6 py-4 font-semibold text-center">Ngày bắt đầu</th>
                                        <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                    {histories.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-zinc-900 text-base line-clamp-1">{item.flashcardTitle}</div>
                                                <div className="text-zinc-400 text-xs mt-0.5">
                                                    {item.totalWords} từ vựng
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.status === 'DONE' ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                                                            style={{ width: `${item.progressPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-zinc-600 w-9 text-right">
                                                            {Math.round(item.progressPercentage)}%
                                                        </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.status === "DONE" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle size={12} />
                                                            Hoàn thành
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                            <Clock size={12} />
                                                            Đang học
                                                        </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-zinc-500">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Calendar size={14} className="text-zinc-400"/>
                                                    {formatDateTime(item.startedAt).split(' ')[0]}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/flashcard/detail/${item.flashcardId}`)}
                                                    className="text-zinc-600 hover:text-emerald-600 font-medium hover:underline transition-colors flex items-center justify-end gap-1 ml-auto"
                                                >
                                                    <Eye size={16} />
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FlashcardHistoryPage;
