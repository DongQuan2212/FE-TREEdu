// src/pages/supporter/FlashcardList.js
import React, { useState, useEffect } from 'react';
import {
    Search, Eye, Edit2, Trash2, Plus, BookOpen, ChevronLeft, ChevronRight,
    Filter, AlertTriangle, Loader2
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { Link, useNavigate } from 'react-router-dom';
import CreateFlashcardModal from '../../components/Supporter/CreateFlashcardModal';
import { flashcardAPI } from "../../config/api";
import { notify } from '../../utils/toastNotify'; // Đã tích hợp hệ thống thông báo Toast chuyên nghiệp

// ─── Component: Hộp thoại xác nhận xóa Custom đẳng cấp ────────────────────────

const ConfirmActionModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center transform animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 text-red-500">
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
                        className="flex-1 sm:flex-none px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg min-w-[140px] disabled:opacity-60 bg-red-600 hover:bg-red-700 shadow-red-600/20"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────

const FlashcardList = () => {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Trạng thái điều khiển Modal xóa Custom mới
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        flashcardId: null,
        title: '',
        message: ''
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const navigate = useNavigate();

    const fetchFlashcards = async (page = 0) => {
        setLoading(true);
        try {
            const res = await flashcardAPI.getAllFlashcards({
                params: {
                    page,
                    size: 10,
                },
            });

            const result = res.data;

            if (result.success && result.data) {
                if (result.data.content) {
                    setFlashcards(result.data.content);
                    setCurrentPage(result.data.pageable.pageNumber);
                    setTotalPages(result.data.totalPages);
                    setTotalElements(result.data.totalElements);
                } else {
                    setFlashcards(result.data);
                    setTotalPages(Math.ceil(result.data.length / 10));
                    setTotalElements(result.data.length);
                }
            }
        } catch (err) {
            console.error('Lỗi tải flashcard:', err);
            if (err.response?.status === 403) {
                notify.error('Bạn không có quyền truy cập dữ liệu này!');
            } else {
                notify.error('Không thể tải danh sách bộ flashcard từ máy chủ!');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards(currentPage);
    }, [currentPage]);

    // Gọi kích hoạt mở Modal Custom thay vì dùng window.confirm
    const handleDeleteClick = (id) => {
        setConfirmModal({
            isOpen: true,
            flashcardId: id,
            title: 'Xóa bộ thẻ Flashcard',
            message: 'Bạn có chắc chắn muốn xóa bộ Flashcard này? Toàn bộ danh sách từ vựng đi kèm bên trong cũng sẽ bị loại bỏ vĩnh viễn khỏi hệ thống.'
        });
    };

    // Thực thi lệnh xóa qua API khi được đồng ý trên Modal Custom
    const executeDelete = async () => {
        const { flashcardId } = confirmModal;
        if (!flashcardId) return;

        setIsActionLoading(true);
        try {
            await flashcardAPI.deleteFlashcard(flashcardId);
            notify.success('Xóa bộ flashcard thành công!');
            setConfirmModal(prev => ({ ...prev, isOpen: false })); // Đóng modal
            fetchFlashcards(currentPage);
        } catch (err) {
            console.error('Lỗi xóa flashcard:', err);
            if (err.response?.status === 403) {
                notify.error('Bạn không có quyền xóa bộ flashcard này!');
            } else {
                notify.error('Quá trình xóa thất bại, vui lòng thử lại sau!');
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    // Lọc dữ liệu tại local client
    const filteredFlashcards = flashcards.filter(fc => {
        const matchSearch = (fc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel = filterLevel === 'all' || fc.level === Number(filterLevel);
        return matchSearch && matchLevel;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                {/* Header nhỏ gọn */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-7 h-7"/>
                                Quản lý Flashcard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">{totalElements} bộ thẻ</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                        >
                            <Plus className="w-4 h-4"/>
                            Tạo mới
                        </button>
                        <CreateFlashcardModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={(newId) => {
                                setShowCreateModal(false);
                                fetchFlashcards(currentPage);
                                navigate(`/supporter/flashcards`);
                            }}
                        />
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc + Tìm kiếm */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tiêu đề, chủ đề, mô tả..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>

                            <select
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Bảng nhỏ gọn */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : filteredFlashcards.length === 0 ? (
                            <div className="p-12 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Không tìm thấy bộ flashcard nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tiêu đề</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Chủ đề</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Cấp độ</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Số từ</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {filteredFlashcards.map((fc) => (
                                            <tr key={fc.id} className="hover:bg-gray-50 transition text-sm">
                                                <td className="px-5 py-4 font-medium text-gray-900 max-w-xs">
                                                    <div className="truncate pr-4" title={fc.title}>
                                                        {fc.title || '(Không có tiêu đề)'}
                                                    </div>
                                                    {fc.description && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">{fc.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                      {fc.topic || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-medium">
                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                      Level {fc.level}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-gray-700">
                                                    {fc.wordCount}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/supporter/flashcards/edit/${fc.id}`)}
                                                            className="p-2 hover:bg-yellow-50 rounded text-yellow-600 transition"
                                                            title="Sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(fc.id)}
                                                            className="p-2 hover:bg-red-50 rounded text-red-600 transition"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Phân trang */}
                                {totalPages > 1 && (
                                    <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                                        <p className="text-gray-600">
                                            Hiển thị {filteredFlashcards.length} trong {totalElements}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                disabled={currentPage === 0}
                                                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
                                                {currentPage + 1} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                                disabled={currentPage === totalPages - 1}
                                                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* MODAL THÔNG BÁO XÁC NHẬN XÓA CUSTOM XỊN SÒ */}
                <ConfirmActionModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={executeDelete}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    loading={isActionLoading}
                />
            </div>
        </div>
    );
};

export default FlashcardList;
