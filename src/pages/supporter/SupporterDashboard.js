import React, { useState, useEffect, useRef } from 'react';
import { 
    BookOpen, 
    CreditCard, 
    Plus, 
    Loader2, 
    Bell, 
    CheckCheck, 
    MessageSquare 
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import { notificationAPI } from '../../config/api';
import NotificationDetailModal from '../../components/user/NotificationDetailModal'; 

// Hàm định dạng thời gian hiển thị thông báo
const formatNotificationTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN');
};

// Component con: Menu thả xuống của thông báo (đã đổi hướng sang phải 'right-0' để hợp với header)
const NotificationDropdown = ({ notifications, onClose, onNotificationClick, onMarkAllAsRead, loading }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-base">Thông báo</span>
                {notifications.length > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline transition-colors"
                    >
                        <CheckCheck size={14} /> Đọc tất cả
                    </button>
                )}
            </div>

            <div className="max-h-[350px] overflow-y-auto chunk-scrollbar">
                {loading ? (
                    <div className="p-8 text-center text-neutral-400 text-sm animate-pulse">Đang tải thông báo...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
                        <Bell size={24} className="text-neutral-300" />
                        <span>Bạn chưa có thông báo nào</span>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => onNotificationClick(notif)}
                            className={`px-4 py-3 border-b border-neutral-50 flex gap-3 transition-colors text-left cursor-pointer ${!notif.isSeen ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-neutral-50'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.isSeen ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                                <MessageSquare size={14} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p className={`text-sm truncate ${!notif.isSeen ? 'font-bold text-neutral-900' : 'font-medium text-neutral-700'}`}>
                                        {notif.title}
                                    </p>
                                    {!notif.isSeen && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{notif.content}</p>
                                <span className="text-[10px] text-neutral-400 mt-1 block">
                                    {formatNotificationTime(notif.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const SupporterDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy user phục vụ logic thông báo

    const [stats, setStats] = useState({
        totalQuizzes: 0,
        totalFlashcards: 0,
    });
    const [loading, setLoading] = useState(true);

    // --- Khởi tạo State Thông báo ---
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const [activeNotification, setActiveNotification] = useState(null);

    // Effect lấy số liệu thống kê
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [quizRes, flashcardRes] = await Promise.all([
                    fetch('http://localhost:3001/api/quiz'),
                    fetch('http://localhost:3001/api/flashcards')
                ]);

                const quizData = await quizRes.json();
                const flashcardData = await flashcardRes.json();

                const totalQuizzes = quizData.success && quizData.data?.content
                    ? quizData.data.content.length
                    : 0;
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

    // Effect: Polling tự động đếm số lượng tin nhắn chưa đọc (Mỗi 30 giây)
    useEffect(() => {
        if (!user) return;
        
        const fetchUnreadCount = async () => {
            try {
                const res = await notificationAPI.getUnreadCount();
                if (res && res.data) setUnreadCount(res.data.data || 0);
            } catch (error) {
                console.error("❌ Lỗi đếm thông báo chưa đọc:", error);
            }
        };
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Khối hàm xử lý sự kiện thông báo
    const handleToggleNotification = async () => {
        const nextState = !isNotifOpen;
        setIsNotifOpen(nextState);

        if (nextState && user) {
            setNotifLoading(true);
            try {
                const res = await notificationAPI.getMyNotifications();
                if (res && res.data) {
                    setNotifications(res.data.data || []);
                }
            } catch (error) {
                console.error("❌ Lỗi tải danh sách thông báo:", error);
            } finally {
                setNotifLoading(false);
            }
        }
    };

    const handleNotificationClick = async (notif) => {
        setActiveNotification(notif);
        setIsNotifOpen(false);

        if (!notif.isSeen) {
            try {
                await notificationAPI.markAsRead(notif.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, isSeen: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("❌ Lỗi đồng bộ trạng thái đọc lên server:", error);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isSeen: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("❌ Lỗi khi đánh dấu đọc tất cả:", error);
        }
    };

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
                            
                            {/* Khu vực bên phải Header: Nút chuông thông báo đứng cạnh Avatar */}
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <button
                                        onClick={handleToggleNotification}
                                        className={`p-2.5 rounded-full border transition-all duration-200 focus:outline-none relative ${
                                            isNotifOpen 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                : 'text-gray-600 hover:text-emerald-600 border-gray-200 hover:bg-gray-50 hover:scale-105'
                                        }`}
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown list thông báo */}
                                    {isNotifOpen && (
                                        <NotificationDropdown
                                            notifications={notifications}
                                            loading={notifLoading}
                                            onClose={() => setIsNotifOpen(false)}
                                            onNotificationClick={handleNotificationClick}
                                            onMarkAllAsRead={handleMarkAllAsRead}
                                        />
                                    )}
                                </div>

                                {/* Khối Avatar chữ S nguyên bản */}
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                                    S
                                </div>
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

            {/* Khối Modal hiển thị thông báo chi tiết độc lập */}
            {activeNotification && (
                <NotificationDetailModal
                    notification={activeNotification}
                    onClose={() => setActiveNotification(null)}
                />
            )}
        </div>
    );
};

export default SupporterDashboard;