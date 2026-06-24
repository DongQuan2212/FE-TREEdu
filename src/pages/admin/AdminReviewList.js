import React, { useState, useEffect } from 'react';
import {
    Search, ShieldAlert, CheckCircle, XCircle, Calendar,
    X, Eye, Loader2, BookOpen, Globe, Lock, Volume2, Layers
} from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
// Import thêm flashcardAPI để lấy chi tiết từ vựng phục vụ Modal xem nhanh
import { flashcardReviewAPI, flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

const AdminReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State quản lý Modal đưa ra quyết định xử phạt
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [decisionType, setDecisionType] = useState(''); // 'REVIEW_VIOLATION' hoặc 'REVIEW_APPROVED'
    const [adminComment, setAdminComment] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // ====== STATE MỚI: QUẢN LÝ MODAL XEM CHI TIẾT FLASHCARD TẠI CHỖ ======
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    // Tải dữ liệu danh sách vi phạm từ Backend
    const fetchPendingReviews = async () => {
        setLoading(true);
        try {
            const response = await flashcardReviewAPI.getPendingReviews();
            if (response.data && response.data.success) {
                const data = response.data.data || [];
                setReviews(data);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách yêu cầu review:', err);
            notify.error('Không thể tải danh sách xét duyệt hoặc bạn không có quyền Admin!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    // ====== HÀM MỚI: GỌI API LẤY CHI TIẾT FLASHCARD ĐỂ HIỂN THỊ MODAL ======
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
            notify.error('Không thể kết nối lấy chi tiết từ vựng.');
        } finally {
            setPreviewLoading(false);
        }
    };

    // Mở Modal phán quyết xử phạt
    const openDecisionModal = (reviewId, type) => {
        setSelectedReviewId(reviewId);
        setDecisionType(type);
        setAdminComment('');
        setIsModalOpen(true);
    };

    // Thực thi gửi quyết định xử phạt lên Backend
    const handleConfirmDecision = async () => {
        if (!adminComment.trim()) {
            notify.warning('Vui lòng nhập lời nhắn hoặc lý do xử lý!');
            return;
        }

        setSubmitLoading(true);
        try {
            const response = await flashcardReviewAPI.submitDecision(
                selectedReviewId,
                decisionType,
                adminComment
            );

            if (response.data && response.data.success) {
                notify.success(
                    decisionType === 'REVIEW_VIOLATION'
                        ? 'Đã xử phạt thành công! Bộ flashcard đã bị chuyển ẩn (PRIVATE).'
                        : 'Đã phê duyệt thành công! Giữ nguyên nội dung bộ flashcard.'
                );
                setIsModalOpen(false);
                fetchPendingReviews();
            }
        } catch (err) {
            console.error('Lỗi xử lý yêu cầu review:', err);
            notify.error(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý phán quyết!');
        } finally {
            setSubmitLoading(false);
        }
    };

    const displayedReviews = reviews.filter(review => {
        const matchSearch = searchTerm === '' ||
            (review.flashcardId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch;
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <ShieldAlert className="w-7 h-7 text-gray-900" />
                                Admin – Xem xét Flashcard vi phạm
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Có {reviews.length} yêu cầu từ Supporter cần bạn duyệt
                            </p>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc tìm kiếm */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo ID Flashcard hoặc Lý do..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                    </div>

                    {/* Bảng Dữ Liệu Hồ Sơ Vi Phạm */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : displayedReviews.length === 0 ? (
                            <div className="p-12 text-center">
                                <ShieldAlert className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Hệ thống sạch bóng! Không có yêu cầu review vi phạm nào tồn đọng.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flashcard ID</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Lý do từ Supporter</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Supporter Gửi</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thời gian gửi</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Tổng yêu cầu liên quan</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-sm">
                                    {displayedReviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50 transition">
                                            <td className="px-5 py-4 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-gray-700 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                                                            {review.flashcardId}
                                                        </span>
                                                    {/* ĐÃ SỬA: Thay đổi onClick để gọi Modal Preview tại chỗ */}
                                                    <button
                                                        onClick={() => handleOpenPreviewModal(review.flashcardId)}
                                                        className="p-1 hover:bg-gray-200 rounded text-blue-600 transition"
                                                        title="Xem nhanh nội dung chi tiết bộ thẻ tại chỗ"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 max-w-xs truncate italic text-gray-700">
                                                "{review.reason || 'Không rõ lý do'}"
                                            </td>

                                            <td className="px-5 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                                {review.supporterId || '—'}
                                            </td>

                                            <td className="px-5 py-4 text-center whitespace-nowrap text-gray-500">
                                                <div className="flex items-center justify-center gap-1 text-xs">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatDateTime(review.requestedAt)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-center font-semibold text-gray-800">
                                                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                                        {review.reportIds?.length || 0} đơn
                                                    </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openDecisionModal(review.id, 'REVIEW_VIOLATION')}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                                                        title="Xác nhận vi phạm (Khóa bộ Flashcard)"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDecisionModal(review.id, 'REVIEW_APPROVED')}
                                                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                                                        title="Xác nhận thông tin chính xác (Flashcard không vi phạm)"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
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

                {/* ======================================================= */}
                {/* MODAL MỚI: XEM CHI TIẾT NỘI DUNG FLASHCARD TẠI CHỖ (PREVIEW) */}
                {/* ======================================================= */}
                {isPreviewModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-gray-500" />
                                    Nội dung chi tiết bộ Flashcard cần thẩm định
                                </h2>
                                <button
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body (Cuộn nội dung độc lập) */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {previewLoading ? (
                                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                                        <p className="text-sm text-gray-500">Đang tải cấu trúc dữ liệu từ vựng...</p>
                                    </div>
                                ) : previewData ? (
                                    <>
                                        {/* Phần thông tin tổng quan của Bộ thẻ */}
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

                                        {/* Phần danh sách từ vựng chi tiết bên trong */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                                <Layers className="w-4 h-4 text-gray-400" />
                                                Danh sách từ vựng ({previewData.words?.length || 0})
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

                {/* MODAL PHÁN QUYẾT ADMIN */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <ShieldAlert className="w-6 h-6 text-gray-900" />
                                    {decisionType === 'REVIEW_VIOLATION' ? 'Xác nhận xử phạt vi phạm' : 'Phê duyệt nội dung chính xác'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                {decisionType === 'REVIEW_VIOLATION'
                                    ? 'Hệ thống sẽ ngay lập tức ép buộc bộ Flashcard này về trạng thái PRIVATE để bảo đảm an toàn dữ liệu cộng đồng.'
                                    : 'Hệ thống sẽ xác nhận nội dung chính xác, giữ nguyên trạng thái hoạt động và đóng toàn bộ hồ sơ báo cáo liên quan.'}
                            </p>

                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                                    Lý do từ Admin (Bắt buộc)
                                </label>
                                <textarea
                                    value={adminComment}
                                    onChange={e => setAdminComment(e.target.value)}
                                    placeholder="Nhập ghi chú phản hồi chi tiết cho quyết định này..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={submitLoading}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition text-gray-700"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleConfirmDecision}
                                    disabled={submitLoading || !adminComment.trim()}
                                    className={`px-5 py-2.5 font-medium rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm text-white ${
                                        decisionType === 'REVIEW_VIOLATION' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-black'
                                    }`}
                                >
                                    {submitLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Flashcard vi phạm'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviewList;
