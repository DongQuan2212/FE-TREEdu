// src/pages/supporter/FlashcardReportList.js
import React, { useState, useEffect } from 'react';
import {
    Search, AlertTriangle, Check, X, Clock, Calendar, MessageSquare, Eye,
    Loader2, BookOpen, Globe, Lock, Volume2, Layers
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { flashcardReportAPI, flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

// ─── Component: Hộp thoại xác nhận hành động báo cáo Custom Xịn Sò ────────────

const ConfirmActionModal = ({ isOpen, title, message, onConfirm, onCancel, loading, variant }) => {
    if (!isOpen) return null;
    const isDanger = variant === 'danger';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center transform animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDanger ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                }`}>
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title || 'Xác nhận hành động'}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">{message}</p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 sm:flex-none px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg min-w-[140px] disabled:opacity-60 ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        }`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────

const FlashcardReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReason, setFilterReason] = useState('all');
    const [processingId, setProcessingId] = useState(null);

    // ====== STATE QUẢN LÝ MODAL XEM CHI TIẾT FLASHCARD TẠI CHỖ ======
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    // ====== STATE MỚI: QUẢN LÝ BẢNG THÔNG BÁO XÁC NHẬN XÓA/XỬ LÝ CUSTOM ======
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        reportId: null,
        newStatus: null,
        title: '',
        message: '',
        variant: 'emerald' // 'emerald' hoặc 'danger'
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

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
        } finally { // ĐÃ SỬA LỖI CHÍNH TẢ Ở ĐÂY
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReports();
    }, []);

    // Gợi mở Modal xem thông tin chi tiết Flashcard gốc
    const handleOpenPreviewModal = async (flashcardId) => {
        setIsPreviewModalOpen(true);
        setPreviewLoading(true);
        setPreviewData(null);
        try {
            const response = await flashcardAPI.getFlashcardDetails(flashcardId);
            if (response.data && response.data.status === 200) {
                setPreviewData(response.data.data);
            } else {
                notify.error('Không tìm thấy dữ liệu chi tiết của bộ flashcard này.');
            }
        } catch (err) {
            console.error('Lỗi lấy chi tiết flashcard:', err);
            notify.error('Không thể kết nối máy chủ để lấy danh sách từ vựng.');
        } finally { // ĐÃ SỬA LỖI CHÍNH TẢ Ở ĐÂY
            setPreviewLoading(false);
        }
    };

    // 2. Kích hoạt gọi API thực tế khi Supporter nhấn nút đồng ý trên Modal Custom mới
    const executeStatusUpdate = async () => {
        const { reportId, newStatus } = confirmModal;
        if (!reportId || !newStatus) return;

        setIsActionLoading(true);
        setProcessingId(reportId);
        try {
            const response = await flashcardReportAPI.updateReportStatus(reportId, newStatus);

            if (response.data && response.data.success) {
                notify.success(
                    newStatus === 'REPORT_RESOLVED'
                        ? 'Đã xác nhận vi phạm và gửi yêu cầu xét duyệt tới Admin!'
                        : 'Đã từ chối báo cáo vi phạm thành công!'
                );
                fetchPendingReports();
                setConfirmModal(prev => ({ ...prev, isOpen: false })); // Đóng modal khi hoàn thành
            } else {
                notify.error(response.data?.message || 'Cập nhật thất bại!');
            }
        } catch (err) {
            console.error('Lỗi cập nhật báo cáo:', err);
            const msg = err.response?.data?.message || 'Lỗi kết nối máy chủ!';
            notify.error(msg);
        } finally { // ĐÃ SỬA LỖI CHÍNH TẢ Ở ĐÂY
            setIsActionLoading(false);
            setProcessingId(null);
        }
    };

    const uniqueReasons = [...new Set(reports.map(r => r.reason).filter(Boolean))];

    const filteredReports = reports.filter(report => {
        const matchSearch = (report.flashcardId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.reportedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchReason = filterReason === 'all' || report.reason === filterReason;
        return matchSearch && matchReason;
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
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
                                                        onClick={() => handleOpenPreviewModal(report.flashcardId)}
                                                        className="p-1 hover:bg-gray-200 rounded text-blue-600 transition"
                                                        title="Xem chi tiết nội dung bộ Flashcard"
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
                                                    {/* NÚT: XÁC NHẬN VI PHẠM (HIỂN THỊ MODAL MÀU XANH EMERALD AN TOÀN) */}
                                                    <button
                                                        onClick={() => setConfirmModal({
                                                            isOpen: true,
                                                            reportId: report.id,
                                                            newStatus: 'REPORT_RESOLVED',
                                                            title: 'Xác nhận xử lý vi phạm',
                                                            message: 'Bạn có chắc chắn muốn xác nhận bộ Flashcard này vi phạm không? Hệ thống sẽ gửi yêu cầu phê duyệt khóa/ẩn lên tài khoản Admin.',
                                                            variant: 'emerald'
                                                        })}
                                                        disabled={processingId !== null}
                                                        className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition disabled:opacity-50"
                                                        title="Xác nhận vi phạm"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>

                                                    {/* NÚT: TỪ CHỐI BÁO CÁO (HIỂN THỊ MODAL MÀU ĐỎ CẢNH BÁO) */}
                                                    <button
                                                        onClick={() => setConfirmModal({
                                                            isOpen: true,
                                                            reportId: report.id,
                                                            newStatus: 'REPORT_REJECTED',
                                                            title: 'Từ chối báo cáo vi phạm',
                                                            message: 'Hành động này sẽ hủy bỏ báo cáo từ người dùng, bộ Flashcard này vẫn sẽ hiển thị bình thường trên hệ thống.',
                                                            variant: 'danger'
                                                        })}
                                                        disabled={processingId !== null}
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

                {/* MODAL: XEM CHI TIẾT NỘI DUNG FLASHCARD TẠI CHỖ (PREVIEW) */}
                {isPreviewModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gray-500" />
                                    Nội dung chi tiết bộ Flashcard bị báo cáo
                                </h2>
                                <button
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {previewLoading ? (
                                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                                        <p className="text-sm text-gray-500">Đang tải thông tin và từ vựng từ máy chủ...</p>
                                    </div>
                                ) : previewData ? (
                                    <>
                                        {/* Tổng quan bộ thẻ */}
                                        <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                                                    previewData.type === 'SYSTEM' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                    {previewData.type === 'SYSTEM' ? 'Hệ thống' : 'Thành viên'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-gray-200 text-gray-700">
                                                    {previewData.visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                    {previewData.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-2">{previewData.title}</h3>
                                            <p className="text-gray-600 text-sm italic mb-4">
                                                {previewData.description || 'Chưa có mô tả cho bộ thẻ này.'}
                                            </p>

                                            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 text-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Chủ đề</p>
                                                    <p className="font-semibold text-gray-800 text-sm">{previewData.topic}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mức độ</p>
                                                    <p className="font-semibold text-gray-800 text-sm">Level {previewData.level}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tổng số từ</p>
                                                    <p className="font-semibold text-gray-800 text-sm">{previewData.wordCount} từ</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danh sách từ vựng */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                                <Layers className="w-4 h-4 text-gray-400" />
                                                Danh sách từ vựng gốc ({previewData.words?.length || 0})
                                            </h4>

                                            {previewData.words && previewData.words.length > 0 ? (
                                                previewData.words.map((word) => (
                                                    <div key={word.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 hover:border-gray-400 transition bg-white">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <span className="text-base font-bold text-gray-900">{word.newWord}</span>
                                                                <span className="text-xs text-gray-400">({word.wordForm})</span>
                                                                {word.phoneme && <span className="text-xs text-gray-500 font-mono">/{word.phoneme}/</span>}
                                                                {word.audioURL && (
                                                                    <button
                                                                        onClick={() => new Audio(word.audioURL).play()}
                                                                        className="text-gray-400 hover:text-gray-900 transition"
                                                                    >
                                                                        <Volume2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-700 mb-2">
                                                                <span className="font-medium text-gray-900">Nghĩa:</span> {word.meaning}
                                                            </p>
                                                            {word.example && (
                                                                <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                                                                    "{word.example}"
                                                                </p>
                                                            )}
                                                        </div>
                                                        {word.imageURL && (
                                                            <img
                                                                src={word.imageURL}
                                                                alt=""
                                                                className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                                            />
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-xl">
                                                    Bộ thẻ này rỗng, không chứa từ vựng nào.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-red-500 text-center py-6">Không tìm thấy dữ liệu.</p>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-150 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition"
                                >
                                    Đóng cửa sổ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* HỘP THOẠI XÁC NHẬN CUSTOM ĐÃ THAY THẾ CHO WINDOW.CONFIRM */}
                <ConfirmActionModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    variant={confirmModal.variant}
                    onConfirm={executeStatusUpdate}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    loading={isActionLoading}
                />
            </div>
        </div>
    );
};

export default FlashcardReportList;
