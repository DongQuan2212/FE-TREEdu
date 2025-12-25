import React, { useEffect, useState } from 'react';
import {
    Users, BookOpen, Activity, CheckCircle,
    Bell, TrendingUp, UserCheck, Layers, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Admin/Sidebar"; // Đảm bảo đường dẫn đúng
import axiosInstance from '../../config/axiosConfig'; // Import axios config của bạn

const AdminHomepage = () => {
    const navigate = useNavigate();

    // State quản lý toàn bộ dữ liệu dashboard
    const [dashboardData, setDashboardData] = useState({
        loading: true,
        stats: {
            totalUsers: 0,
            totalFlashcards: 0,
            quizAttemptsToday: 0,
            totalQuizAttempts: 0
        },
        topQuizzes: [],
        recentFlashcards: [],
        userDistribution: { admin: 0, supporter: 0, member: 0 },
        flashcardDistribution: { system: 0, member: 0 }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Gọi 3 API song song để tối ưu tốc độ
                const [usersRes, flashcardsRes, quizStatsRes] = await Promise.all([
                    axiosInstance.get('/users/?size=20000', { draw: 1, start: 0, length: 100 }), // Lấy danh sách user (giả sử lấy 100 để tính role)
                    axiosInstance.get('/flashcards'),
                    axiosInstance.get('/quiz/admin/stats')
                ]);

                // 1. Xử lý dữ liệu User
                const usersData = usersRes.data.data || [];
                const totalUsers = usersRes.data.recordsTotal || 0;

                // Đếm Role
                const roles = { admin: 0, supporter: 0, member: 0 };
                usersData.forEach(u => {
                    const r = u.role?.toLowerCase();
                    if (r === 'admin') roles.admin++;
                    else if (r === 'supporter') roles.supporter++;
                    else roles.member++;
                });

                // 2. Xử lý dữ liệu Flashcard
                const flashcardsList = flashcardsRes.data.data || [];

                // Đếm loại (System vs Member)
                const types = { system: 0, member: 0 };
                flashcardsList.forEach(f => {
                    if (f.type === 'SYSTEM') types.system++;
                    else types.member++;
                });

                // Lấy 5 bài mới nhất
                const sortedFlashcards = [...flashcardsList].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                ).slice(0, 5);

                // 3. Xử lý Quiz Stats
                const quizStats = quizStatsRes.data || {};

                // Update State
                setDashboardData({
                    loading: false,
                    stats: {
                        totalUsers: totalUsers,
                        totalFlashcards: flashcardsList.length,
                        quizAttemptsToday: quizStats.attemptsToday || 0,
                        totalQuizAttempts: quizStats.totalAttempts || 0
                    },
                    topQuizzes: quizStats.topQuizzes || [],
                    recentFlashcards: sortedFlashcards,
                    userDistribution: roles,
                    flashcardDistribution: types
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setDashboardData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    // Helper: Tính phần trăm cho thanh progress bar
    const calculatePercent = (val, total) => total === 0 ? 0 : Math.round((val / total) * 100);

    // Cards thống kê trên cùng
    const statCards = [
        {
            label: "Tổng người dùng",
            value: dashboardData.stats.totalUsers,
            icon: Users,
            color: "bg-blue-500",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            label: "Bộ Flashcards",
            value: dashboardData.stats.totalFlashcards,
            icon: BookOpen,
            color: "bg-purple-500",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            label: "Lượt thi hôm nay",
            value: dashboardData.stats.quizAttemptsToday,
            icon: Activity,
            color: "bg-orange-500",
            bgLight: "bg-orange-50",
            textColor: "text-orange-600"
        },
        {
            label: "Tổng lượt làm bài",
            value: dashboardData.stats.totalQuizAttempts,
            icon: CheckCircle,
            color: "bg-green-500",
            bgLight: "bg-green-50",
            textColor: "text-green-600"
        },
    ];

    const quickActions = [
        { title: "Quản lý User", desc: "Phân quyền & Khóa", icon: UserCheck, color: "from-blue-500 to-blue-600", path: "/admin/employee" },
        { title: "Quản lý Flashcard", desc: "Duyệt & Tạo mới", icon: Layers, color: "from-purple-500 to-purple-600", path: "/admin/flashcard" },
        { title: "Quản lý Quiz", desc: "Ngân hàng câu hỏi", icon: Activity, color: "from-orange-500 to-red-600", path: "/admin/quiz" },

    ];

    if (dashboardData.loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex items-center gap-4">

                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Xin chào, Admin! 👋
                        </h2>
                        <p className="text-gray-600">Tổng quan hệ thống ngày {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    {/* 1. STATS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className={`text-sm font-bold ${stat.bgLight} ${stat.textColor} px-2 py-1 rounded-full`}>
                                        Live
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* 2. MAIN CONTENT SPLIT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                        {/* Cột trái (Chiếm 2 phần): Top Quiz & Flashcard mới */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Top Popular Quizzes */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-orange-500" />
                                        Quiz Hot Nhất
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Tên Quiz</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Lượt làm</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                        {dashboardData.topQuizzes.length > 0 ? (
                                            dashboardData.topQuizzes.map((quiz, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{quiz.quizTitle}</td>
                                                    <td className="px-4 py-3 text-right text-orange-600 font-bold">{quiz.attemptCount}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="px-4 py-8 text-center text-gray-400">Chưa có dữ liệu quiz</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Newest Flashcards */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-purple-500" />
                                        Flashcards Mới Tạo
                                    </h3>
                                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full cursor-pointer hover:bg-purple-100">Xem tất cả</span>
                                </div>
                                <div className="space-y-4">
                                    {dashboardData.recentFlashcards.map((fc) => (
                                        <div key={fc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold text-sm shadow-sm
                                                    ${fc.type === 'SYSTEM' ? 'bg-green-300' : 'bg-green-300'}`}>
                                                    {fc.type === 'SYSTEM' ? 'SYS' : 'USER'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition">{fc.title}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{fc.wordCount} từ</span>
                                                        <span>•</span>
                                                        <span>{fc.topic}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-gray-400 flex flex-col items-end">
                                                <Calendar className="w-3 h-3 mb-1"/>
                                                {new Date(fc.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    ))}
                                    {dashboardData.recentFlashcards.length === 0 && (
                                        <p className="text-center text-gray-400 py-4">Chưa có bộ thẻ nào.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cột phải (Chiếm 1 phần): Phân bố hệ thống */}
                        <div className="space-y-8">

                            {/* Phân bố User */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    Phân bố User
                                </h3>
                                <div className="space-y-5">
                                    {/* Admin Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 font-medium">Admin</span>
                                            <span className="text-gray-900 font-bold">{dashboardData.userDistribution.admin}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${calculatePercent(dashboardData.userDistribution.admin, dashboardData.stats.totalUsers)}%` }}></div>
                                        </div>
                                    </div>
                                    {/* Supporter Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 font-medium">Supporter</span>
                                            <span className="text-gray-900 font-bold">{dashboardData.userDistribution.supporter}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${calculatePercent(dashboardData.userDistribution.supporter, dashboardData.stats.totalUsers)}%` }}></div>
                                        </div>
                                    </div>
                                    {/* Member Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 font-medium">Member</span>
                                            <span className="text-gray-900 font-bold">{dashboardData.userDistribution.member}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${calculatePercent(dashboardData.userDistribution.member, dashboardData.stats.totalUsers)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phân bố Flashcard */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-indigo-500" />
                                    Nguồn Flashcard
                                </h3>
                                <div className="flex items-center justify-center py-4">
                                    {/* Vẽ 2 vòng tròn hoặc hiển thị số liệu đơn giản */}
                                    <div className="grid grid-cols-2 gap-4 w-full text-center">
                                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <p className="text-2xl font-bold text-indigo-600">{dashboardData.flashcardDistribution.system}</p>
                                            <p className="text-xs text-indigo-400 font-semibold uppercase mt-1">Hệ thống</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <p className="text-2xl font-bold text-emerald-600">{dashboardData.flashcardDistribution.member}</p>
                                            <p className="text-xs text-emerald-400 font-semibold uppercase mt-1">Người dùng</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    Tỉ lệ bài học do hệ thống tạo so với người dùng đóng góp.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-6">Truy cập nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-lg hover:border-gray-300 transition transform hover:-translate-y-1 group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} p-3 mb-4 shadow-md group-hover:scale-110 transition duration-300`}>
                                    <action.icon className="w-full h-full text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h4>
                                <p className="text-sm text-gray-500">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminHomepage;
