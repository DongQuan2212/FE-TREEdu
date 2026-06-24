import React, { useState, useEffect, useRef } from 'react';
import {
    BookOpen,
    CreditCard,
    Plus,
    Loader2,
    Bell,
    CheckCheck,
    MessageSquare,
    AlertCircle,
    Activity,
    Clock,
    ChevronRight,
    CheckCircle
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';
import { notificationAPI } from '../../config/api';
import NotificationDetailModal from '../../components/user/NotificationDetailModal';

const formatNotificationTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN');
};

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
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalQuizzes: 0,
        totalFlashcards: 0,
        pendingReports: 4, // Mock data phục vụ quản lý báo cáo lỗi
        contributionsThisMonth: 12
    });
    const [loading, setLoading] = useState(true);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const [activeNotification, setActiveNotification] = useState(null);

    // Giả lập danh sách hoạt động gần đây để lấp đầy khoảng trống đơn điệu
    const [recentActivities] = useState([
        { id: 1, type: 'quiz', name: 'Trắc nghiệm Ngữ pháp nâng cao B2', time: '2 giờ trước', status: 'published' },
        { id: 2, type: 'flashcard', name: 'Bộ từ vựng Chủ đề Công nghệ IELTS', time: 'Hôm qua', status: 'published' },
        { id: 3, type: 'quiz', name: 'Luyện nghe chính tả - Bài số 5', time: '3 ngày trước', status: 'draft' },
    ]);

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

                setStats(prev => ({
                    ...prev,
                    totalQuizzes: totalQuizzesAccurate,
                    totalFlashcards,
                }));
            } catch (err) {
                console.error('Lỗi tải thống kê:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
            <div className="min-h-screen bg-[#fafaf8] flex">
                <SupporterSidebar />
                <div className="flex-1 ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
                        <p className="text-neutral-500 text-sm">Đang tải dữ liệu hệ thống...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf8] flex font-sans antialiased text-neutral-800">
            <SupporterSidebar />

            <div className="flex-1 ml-72 flex flex-col min-w-0">
                {/* Header hiện đại */}
                <header className="bg-white border-b border-neutral-100 sticky top-0 z-40 px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">Tổng quan làm việc</h1>
                            <p className="text-sm text-neutral-500 mt-0.5">Chào mừng trở lại! Hôm nay bạn có một vài nhiệm vụ mới.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={handleToggleNotification}
                                    className={`p-2.5 rounded-full border transition-all relative ${
                                        isNotifOpen
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            : 'text-neutral-600 hover:text-emerald-600 border-neutral-200 hover:bg-neutral-50'
                                    }`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

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

                            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                S
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-[1400px] w-full mx-auto flex-1 flex flex-col gap-8">

                    {/* Hàng 4 thẻ KPIs thu nhỏ gọn gàng, tăng mật độ thông tin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Quiz đã tạo</p>
                                <p className="text-2xl font-bold text-neutral-900 mt-0.5">{stats.totalQuizzes}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><CreditCard className="w-6 h-6" /></div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Flashcard đã tạo</p>
                                <p className="text-2xl font-bold text-neutral-900 mt-0.5">{stats.totalFlashcards}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Báo cáo chưa xử lý</p>
                                <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.pendingReports}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity className="w-6 h-6" /></div>
                            <div>
                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tạo mới tháng này</p>
                                <p className="text-2xl font-bold text-neutral-900 mt-0.5">{stats.contributionsThisMonth}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bố cục 2 Cột Chuyên nghiệp (Trái: Nội dung & Hoạt động, Phải: Hành động & Việc cần làm) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* CỘT TRÁI (Chiếm 2 phần) */}
                        <div className="lg:col-span-2 flex flex-col gap-8">

                            {/* Bảng hoạt động gần đây */}
                            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                                    <h3 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                                        <Clock size={18} className="text-neutral-400" />
                                        Nội dung vừa xử lý gần đây
                                    </h3>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {recentActivities.map((act) => (
                                        <div key={act.id} className="p-4 px-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`p-2 rounded-lg ${act.type === 'quiz' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {act.type === 'quiz' ? <BookOpen size={16} /> : <CreditCard size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-800 truncate">{act.name}</p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">{act.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                    act.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {act.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                                </span>
                                                <ChevronRight size={16} className="text-neutral-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Khu vực Lối tắt hành động nhanh */}
                            <div>
                                <h3 className="font-bold text-neutral-900 text-lg mb-4">Thao tác nhanh công việc</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/supporter/quizzes/create')}
                                        className="group bg-white p-5 rounded-xl border border-neutral-200 hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition"><BookOpen size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-neutral-800 text-sm">Tạo Quiz trắc nghiệm</h4>
                                                <p className="text-xs text-neutral-400 mt-0.5">Điền từ, nghe hiểu, phát âm...</p>
                                            </div>
                                        </div>
                                        <Plus size={18} className="text-neutral-400 group-hover:text-blue-600 transition" />
                                    </button>

                                    <button
                                        onClick={() => navigate('/supporter/flashcards')}
                                        className="group bg-white p-5 rounded-xl border border-neutral-200 hover:border-purple-500 hover:shadow-md transition-all text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition"><CreditCard size={20} /></div>
                                            <div>
                                                <h4 className="font-bold text-neutral-800 text-sm">Thêm bộ Flashcard</h4>
                                                <p className="text-xs text-neutral-400 mt-0.5">Thẻ từ vựng, hình ảnh, âm thanh...</p>
                                            </div>
                                        </div>
                                        <Plus size={18} className="text-neutral-400 group-hover:text-purple-600 transition" />
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* CỘT PHẢI (Chiếm 1 phần) */}
                        <div className="flex flex-col gap-6">
                            {/* Tiện ích Nhắc việc: Báo cáo khẩn cấp từ học viên */}
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm">
                                <h3 className="font-bold text-neutral-900 text-base mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-red-500" />
                                    Báo cáo lỗi cần xử lý ngay
                                </h3>

                                <div className="space-y-3.5">
                                    <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">Lỗi âm thanh</span>
                                            <span className="text-[11px] text-neutral-400">10 phút trước</span>
                                        </div>
                                        <p className="text-xs font-semibold text-neutral-800 mt-1.5 truncate">Flashcard "Incorporate" không nghe được phát âm</p>
                                        <p className="text-[11px] text-neutral-500 mt-0.5">Người gửi: Nguyễn Văn A</p>
                                    </div>

                                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">Sai đáp án</span>
                                            <span className="text-[11px] text-neutral-400">1 giờ trước</span>
                                        </div>
                                        <p className="text-xs font-semibold text-neutral-800 mt-1.5 truncate">Câu hỏi 4 - Quiz Ngữ pháp Hiện tại hoàn thành</p>
                                        <p className="text-[11px] text-neutral-500 mt-0.5">Người gửi: Trần Thị B</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/supporter/flashcards')} // Điều hướng đến trang báo cáo tương ứng
                                    className="w-full text-center text-xs font-bold text-neutral-600 hover:text-emerald-600 mt-4 pt-3 border-t border-neutral-100 block transition-colors"
                                >
                                    Xem toàn bộ báo cáo lỗi ({stats.pendingReports})
                                </button>
                            </div>

                            {/* Thẻ trạng thái hệ thống / Tips nhỏ cho Supporter */}
                            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-sm text-left relative overflow-hidden">
                                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white">
                                    <CheckCircle size={140} />
                                </div>
                                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 mb-2">
                                    <CheckCircle size={14} /> Mẹo làm việc hiệu quả
                                </h4>
                                <p className="text-xs leading-relaxed text-neutral-300">
                                    Kiểm tra kỹ phần giải thích nghĩa (Definition) và âm thanh phiên âm trước khi xuất bản bộ Flashcard mới để giúp học viên tránh nhầm lẫn nhé!
                                </p>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

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
