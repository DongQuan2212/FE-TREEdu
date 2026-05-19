import React, { useState, useEffect } from 'react';
import {
    Search, ShieldAlert, CheckCircle, XCircle, Clock, Calendar,
    ChevronLeft, ChevronRight, X, Eye, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Admin/Sidebar";
import { flashcardReviewAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

const AdminReviewList = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Phân trang đồng bộ
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // State quản lý Modal đưa ra quyết định
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [decisionType, setDecisionType] = useState(''); // 'REVIEW_VIOLATION' hoặc 'REVIEW_APPROVED'
    const [adminComment, setAdminComment] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // Tải dữ liệu từ Backend
    const fetchPendingReviews = async () => {
        setLoading(true);
        try {
            const response = await flashcardReviewAPI.getPendingReviews();
            // Đọc cấu trúc bọc dữ liệu chuẩn: response.data.success và lấy mảng trong response.data.data
            if (response.data && response.data.success) {
                const data = response.data.data || [];
                setReviews(data);
                setTotalElements(data.length);
                setTotalPages(Math.ceil(data.length / 10) || 1);
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

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    // Mở Modal phán quyết
    const openDecisionModal = (reviewId, type) => {
        setSelectedReviewId(reviewId);
        setDecisionType(type);
        setAdminComment('');
        setIsModalOpen(true);
    };

    // Thực thi gửi dữ liệu lên Backend
    const handleConfirmDecision = async () => {
        if (!adminComment.trim()) {
            notify.warning('Vui lòng nhập lời nhắn hoặc lý do xử lý!');
            return;
        }

        setSubmitLoading(true);
        try {
            // Gọi API truyền lên đúng cấu trúc trùng khớp Postman
            const response = await flashcardReviewAPI.submitDecision(
                selectedReviewId,
                decisionType, // Sẽ gửi đi 'REVIEW_VIOLATION' hoặc 'REVIEW_APPROVED'
                adminComment
            );

            if (response.data && response.data.success) {
                notify.success(
                    decisionType === 'REVIEW_VIOLATION'
                        ? 'Đã xử phạt thành công! Bộ flashcard đã bị chuyển ẩn (PRIVATE).'
                        : 'Đã phê duyệt thành công! Giữ nguyên nội dung bộ flashcard.'
                );
                setIsModalOpen(false);
                fetchPendingReviews(); // Reload lại danh sách sau khi xử lý thành công
            }
        } catch (err) {
            console.error('Lỗi xử lý yêu cầu review:', err);
            notify.error(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý phán quyết!');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Tìm kiếm Client-side theo ID Flashcard hoặc Lý do từ mảng dữ liệu trả về
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
                                Admin – Thẩm định Flashcard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Có {totalElements} yêu cầu từ Supporter cần bạn duyệt
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
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flashcard ID</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Lý do từ Supporter</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Supporter Gửi</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thời gian gửi</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Tổng đơn liên đới</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Quyết định tối cao</th>
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
                                                        <button
                                                            onClick={() => navigate(`/flashcard/detail/${review.flashcardId}`)}
                                                            className="p-1 hover:bg-gray-200 rounded text-blue-600 transition"
                                                            title="Xem nội dung chi tiết bộ thẻ"
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
                                                        {/* NÚT PHẠT VI PHẠM */}
                                                        <button
                                                            onClick={() => openDecisionModal(review.id, 'REVIEW_VIOLATION')}
                                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                                                            title="Xác nhận vi phạm (Khóa bộ Flashcard)"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                        {/* NÚT PHÊ DUYỆT CHÍNH XÁC (Thay thế DISMISSED bằng APPROVED chuẩn Postman) */}
                                                        <button
                                                            onClick={() => openDecisionModal(review.id, 'REVIEW_APPROVED')}
                                                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                                                            title="Xác nhận thông tin chính xác (Duyệt thông qua)"
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
                            </>
                        )}
                    </div>
                </main>

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
                                    Lời nhắn / Lý do từ Admin (Bắt buộc)
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
                                        'Xác nhận Phán Quyết'
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
