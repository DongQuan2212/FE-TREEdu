import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// Hàm định dạng thời gian nội bộ cho modal
const formatNotificationTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN');
};

const NotificationDetailModal = ({ notification, onClose }) => {
    useEffect(() => {
        // Khóa cuộn trang nền khi modal đang mở
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    if (!notification) return null;

    return (
        /*
          🌟 GIẢI PHÁP Ở ĐÂY:
          - z-[9999]: Đảm bảo đè lên hoàn toàn fixed header và tất cả layout khác.
          - w-screen h-screen fixed inset-0: Ép phủ rộng toàn bộ màn hình máy tính độc lập.
          - bg-black/60 backdrop-blur-sm: Tạo lớp nền tối mịn che mờ các layout bên dưới.
        */
        <div className="fixed inset-0 w-screen h-screen bg-black/65 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">

            {/* Lớp overlay trong suốt ở dưới, click vào khoảng không tối là đóng modal */}
            <div className="absolute inset-0 w-full h-full cursor-default" onClick={onClose} />

            {/* Hộp thoại nội dung chính - Nằm chính giữa màn hình */}
            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 transform animate-in zoom-in-95 duration-200 overflow-hidden z-10">

                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                        {notification.type || 'Hệ thống'}
                    </span>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/60 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-3 leading-snug">
                        {notification.title}
                    </h3>
                    <div className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100 max-h-[250px] overflow-y-auto chunk-scrollbar">
                        {notification.content}
                    </div>
                    <div className="mt-4 text-right">
                        <span className="text-xs text-neutral-400 font-medium">
                            Thời gian: {formatNotificationTime(notification.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm active:scale-95"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailModal;
