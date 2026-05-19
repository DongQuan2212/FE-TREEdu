import React, { useState, useEffect } from 'react';
import {
    Search, AlertTriangle, Check, X, Clock, Calendar, MessageSquare, Eye
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';
import { flashcardReportAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

const FlashcardReportList = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReason, setFilterReason] = useState('all');
    const [processingId, setProcessingId] = useState(null);

    // 1. Tải dữ liệu báo cáo chưa xử lý (REPORT_PENDING) từ Backend
    const fetchPendingReports = async () => {
        setLoading(true);
        try {
            const response = await flashcardReportAPI.getPendingReports();
            if (response.data && response.data.success) {
                setReports(response.data.data || []);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách báo cáo:', err);
            notify.error('Không thể tải danh sách báo cáo hoặc bạn không có quyền!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReports();
    }, []);

    // 2. Cập nhật trạng thái báo cáo (Xác nhận vi phạm để tự động đẩy lên Admin)
    const handleUpdateStatus = async (reportId, newStatus) => {
        const confirmMsg = newStatus === 'REPORT_RESOLVED'
            ? 'Xác nhận xử lý vi phạm? Hệ thống sẽ tự động gửi yêu cầu phê duyệt lên Admin.'
            : 'Từ chối báo cáo vi phạm này?';

        if (!window.confirm(confirmMsg)) return;

        setProcessingId(reportId);
        try {
            // Gửi request kèm body đúng cấu trúc Map<String, String> như Controller yêu cầu
            const response = await flashcardReportAPI.updateReportStatus(reportId, newStatus);

            if (response.data && response.data.success) {
                notify.success(
                    newStatus === 'REPORT_RESOLVED'
                        ? 'Đã xác nhận vi phạm và gửi yêu cầu xét duyệt tới Admin!'
                        : 'Đã từ chối báo cáo!'
                );
                fetchPendingReports(); // Tải lại danh sách sau khi xử lý thành công
            } else {
                notify.error(response.data?.message || 'Cập nhật thất bại!');
            }
        } catch (err) {
            console.error('Lỗi cập nhật báo cáo:', err);
            const msg = err.response?.data?.message || 'Lỗi kết nối máy chủ!';
            notify.error(msg);
        } finally {
            setProcessingId(null);
        }
    };

    // Lọc danh sách lý do báo cáo để bỏ vào thẻ select lọc dữ liệu
    const uniqueReasons = [...new Set(reports.map(r => r.reason).filter(Boolean))];

    // Bộ lọc tìm kiếm
    const filteredReports = reports.filter(report => {
        const matchSearch = (report.flashcardId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.reportedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchReason = filterReason === 'all' || report.reason === filterReason;
        return matchSearch && matchReason;
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="w-7 h-7 text-amber-500" />
                                Quản lý Báo cáo Flashcard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Có {reports.length} báo cáo chưa xử lý</p>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo ID Flashcard hoặc ID người báo..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                            <select
                                value={filterReason}
                                onChange={e => setFilterReason(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white"
                            >
                                <option value="all">Tất cả lý do báo cáo</option>
                                {uniqueReasons.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Bảng dữ liệu */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="p-12 text-center">
                                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Tuyệt vời! Không có báo cáo vi phạm nào tồn đọng.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flashcard ID</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Lý do báo cáo</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Người báo cáo</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thời gian</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition text-sm">
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-zinc-600 bg-gray-100 px-2 py-1 rounded">{report.flashcardId}</span>
                                                    <button
                                                        onClick={() => navigate(`/flashcard/detail/${report.flashcardId}`)}
                                                        className="p-1 hover:bg-gray-200 rounded text-blue-600 transition"
                                                        title="Xem chi tiết bộ Flashcard"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-700 font-semibold">
                                                {report.reason}
                                            </td>
                                            <td className="px-5 py-4 text-gray-500 font-mono text-xs max-w-[140px] truncate" title={report.reportedBy}>
                                                {report.reportedBy}
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-600 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1 text-xs">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatDateTime(report.reportedAt)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                                                    <Clock className="w-3 h-3 animate-pulse" />
                                                    Chờ xử lý
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Nút chấp nhận: Đổi từ 'RESOLVED' thành đúng Enum định dạng 'REPORT_RESOLVED' */}
                                                    <button
                                                        onClick={() => handleUpdateStatus(report.id, 'REPORT_RESOLVED')}
                                                        disabled={processingId === report.id}
                                                        className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition disabled:opacity-50"
                                                        title="Xác nhận vi phạm"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    {/* Nút từ chối: Hãy chắc chắn trong file EFlashcardReportReviewStatus của bạn có giá trị tương ứng (ví dụ: REPORT_REJECTED hoặc tương tự) */}
                                                    <button
                                                        onClick={() => handleUpdateStatus(report.id, 'REPORT_REJECTED')}
                                                        disabled={processingId === report.id}
                                                        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition disabled:opacity-50"
                                                        title="Từ chối báo cáo"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlashcardReportList;
