// src/pages/supporter/FlashcardList.js
import React, { useState, useEffect } from 'react';
import {
    Search, Eye, Edit2, Trash2, Plus, BookOpen, ChevronLeft, ChevronRight,
    AlertTriangle, Loader2, Globe, Lock, ToggleLeft, ToggleRight
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';
import CreateFlashcardModal from '../../components/Supporter/CreateFlashcardModal';
import { flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

// ─── ConfirmActionModal ────────────────────────────────────
const ConfirmActionModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center border border-gray-100">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50 text-red-500">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
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
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-60 transition"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── VisibilityToggleModal ─────────────────────────────────
const VisibilityToggleModal = ({ isOpen, flashcard, onConfirm, onCancel, loading }) => {
    if (!isOpen || !flashcard) return null;

    const isCurrentlyPublic = flashcard.visibility === 'PUBLIC';
    const nextLabel  = isCurrentlyPublic ? 'Riêng tư' : 'Công khai';
    const nextIcon   = isCurrentlyPublic ? <Lock className="w-8 h-8" /> : <Globe className="w-8 h-8" />;
    const iconBg     = isCurrentlyPublic ? 'bg-yellow-50 text-yellow-500' : 'bg-green-50 text-green-500';
    const btnColor   = isCurrentlyPublic ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center border border-gray-100">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
                    {nextIcon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Chuyển sang {nextLabel}?
                </h3>
                <p className="text-sm text-gray-500 mb-1 leading-relaxed px-2">
                    Bộ flashcard <span className="font-semibold text-gray-800">"{flashcard.title}"</span>
                </p>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
                    {isCurrentlyPublic
                        ? 'sẽ bị ẩn khỏi người dùng khác. Nếu đã có người học, thao tác này sẽ bị từ chối.'
                        : 'sẽ hiển thị công khai cho tất cả người dùng.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 sm:flex-none px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-60 transition ${btnColor}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xử lý...' : `Chuyển sang ${nextLabel}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main ──────────────────────────────────────────────────
const FlashcardList = () => {
    const [flashcards, setFlashcards]         = useState([]);
    const [loading, setLoading]               = useState(true);
    const [searchTerm, setSearchTerm]         = useState('');
    const [filterLevel, setFilterLevel]       = useState('all');
    const [filterVisibility, setFilterVisibility] = useState('all'); // 'all' | 'PUBLIC' | 'PRIVATE'
    const [filterType, setFilterType]         = useState('all');     // 'all' | 'SYSTEM' | 'BY_MEMBER'
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Pagination (client-side vì BE trả list)
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage]       = useState(0);

    // Delete modal
    const [confirmModal, setConfirmModal]     = useState({ isOpen: false, flashcardId: null });
    const [isDeleting, setIsDeleting]         = useState(false);

    // Visibility toggle modal
    const [visModal, setVisModal]             = useState({ isOpen: false, flashcard: null });
    const [isToggling, setIsToggling]         = useState(false);

    const navigate = useNavigate();

    // ── Fetch toàn bộ (admin/sp không bị lọc ở BE) ────────
    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const res = await flashcardAPI.getAllFlashcards();
            const result = res.data;
            if (result.success && result.data) {
                // BE trả array thẳng (không phân trang) khi dùng getAllFlashcard
                const list = Array.isArray(result.data)
                    ? result.data
                    : result.data.content ?? [];
                setFlashcards(list);
            }
        } catch (err) {
            console.error('Lỗi tải flashcard:', err);
            notify.error(
                err.response?.status === 403
                    ? 'Bạn không có quyền truy cập dữ liệu này!'
                    : 'Không thể tải danh sách bộ flashcard!'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFlashcards(); }, []);

    // ── Filter phía client ─────────────────────────────────
    const filtered = flashcards.filter(fc => {
        const matchSearch =
            (fc.title       || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.topic       || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel      = filterLevel      === 'all' || fc.level === Number(filterLevel);
        const matchVisibility = filterVisibility === 'all' || fc.visibility === filterVisibility;
        const matchType       = filterType       === 'all' || fc.type === filterType;
        return matchSearch && matchLevel && matchVisibility && matchType;
    });

    // Reset về trang 0 khi filter thay đổi
    useEffect(() => { setCurrentPage(0); }, [searchTerm, filterLevel, filterVisibility, filterType]);

    const totalPages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated     = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    // ── Delete ─────────────────────────────────────────────
    const handleDeleteClick = (id) => setConfirmModal({ isOpen: true, flashcardId: id });

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await flashcardAPI.deleteFlashcard(confirmModal.flashcardId);
            notify.success('Xóa bộ flashcard thành công!');
            setConfirmModal({ isOpen: false, flashcardId: null });
            fetchFlashcards();
        } catch (err) {
            const msg = err.response?.data?.message || 'Xóa thất bại, thử lại sau!';
            notify.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Visibility toggle ──────────────────────────────────
    const handleVisibilityClick = (fc) => setVisModal({ isOpen: true, flashcard: fc });

    const executeToggleVisibility = async () => {
        const { flashcard } = visModal;
        const nextVisibility = flashcard.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
        setIsToggling(true);
        try {
            await flashcardAPI.changeVisibility(flashcard.id, nextVisibility);
            notify.success(
                nextVisibility === 'PUBLIC'
                    ? 'Đã chuyển sang Công khai!'
                    : 'Đã chuyển sang Riêng tư!'
            );
            setVisModal({ isOpen: false, flashcard: null });
            fetchFlashcards();
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể thay đổi trạng thái!';
            notify.error(msg);
        } finally {
            setIsToggling(false);
        }
    };

    // ── Render helpers ─────────────────────────────────────
    const VisibilityBadge = ({ visibility }) =>
        visibility === 'PUBLIC' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                <Globe className="w-3 h-3" /> Công khai
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-medium">
                <Lock className="w-3 h-3" /> Riêng tư
            </span>
        );

    const TypeBadge = ({ type }) =>
        type === 'SYSTEM' ? (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium">
                Hệ thống
            </span>
        ) : (
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-medium">
                Thành viên
            </span>
        );

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-7 h-7" />
                                Quản lý Flashcard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {filtered.length} / {flashcards.length} bộ thẻ
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                        >
                            <Plus className="w-4 h-4" /> Tạo mới
                        </button>
                        <CreateFlashcardModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={() => {
                                setShowCreateModal(false);
                                fetchFlashcards();
                            }}
                        />
                    </div>
                </header>

                <main className="p-6">

                    {/* BỘ LỌC */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative xl:col-span-2">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm tiêu đề, chủ đề, mô tả..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>

                            {/* Filter: Cấp độ */}
                            <select
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-gray-900"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {[1, 2, 3, 4, 5, 6].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>

                            {/* Filter: Loại */}
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-gray-900"
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="SYSTEM">Hệ thống</option>
                                <option value="BY_MEMBER">Thành viên</option>
                            </select>

                            {/* Filter: Chế độ hiển thị */}
                            <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                                {[
                                    { value: 'all',     label: 'Tất cả' },
                                    { value: 'PUBLIC',  label: 'Công khai' },
                                    { value: 'PRIVATE', label: 'Riêng tư' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFilterVisibility(opt.value)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${
                                            filterVisibility === opt.value
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt.value === 'PUBLIC'  && <Globe className="w-3.5 h-3.5" />}
                                        {opt.value === 'PRIVATE' && <Lock  className="w-3.5 h-3.5" />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BẢNG */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                            </div>
                        ) : filtered.length === 0 ? (
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
                                            {['Tiêu đề', 'Chủ đề', 'Loại', 'Cấp độ', 'Số từ', 'Chế độ', 'Hành động'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                        {paginated.map(fc => (
                                            <tr key={fc.id} className="hover:bg-gray-50 transition text-sm">
                                                {/* Tiêu đề */}
                                                <td className="px-5 py-4 max-w-xs">
                                                    <div className="font-medium text-gray-900 truncate" title={fc.title}>
                                                        {fc.title || '(Không có tiêu đề)'}
                                                    </div>
                                                    {fc.description && (
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{fc.description}</p>
                                                    )}
                                                </td>

                                                {/* Chủ đề */}
                                                <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                                            {fc.topic || '—'}
                                                        </span>
                                                </td>

                                                {/* Loại */}
                                                <td className="px-5 py-4">
                                                    <TypeBadge type={fc.type} />
                                                </td>

                                                {/* Cấp độ */}
                                                <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                            Level {fc.level}
                                                        </span>
                                                </td>

                                                {/* Số từ */}
                                                <td className="px-5 py-4 text-center font-bold text-gray-700">
                                                    {fc.wordCount ?? 0}
                                                </td>

                                                {/* Chế độ + Toggle */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <VisibilityBadge visibility={fc.visibility} />
                                                        <button
                                                            onClick={() => handleVisibilityClick(fc)}
                                                            title={fc.visibility === 'PUBLIC' ? 'Chuyển sang Riêng tư' : 'Chuyển sang Công khai'}
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                                        >
                                                            {fc.visibility === 'PUBLIC'
                                                                ? <ToggleRight className="w-5 h-5 text-green-500" />
                                                                : <ToggleLeft  className="w-5 h-5 text-gray-400" />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Hành động */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
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

                                {/* PHÂN TRANG */}
                                {totalPages > 1 && (
                                    <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                                        <p className="text-gray-600">
                                            Hiển thị {currentPage * PAGE_SIZE + 1}–
                                            {Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)}{' '}
                                            trong {filtered.length}
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
            </div>

            {/* MODALS */}
            <ConfirmActionModal
                isOpen={confirmModal.isOpen}
                title="Xóa bộ thẻ Flashcard"
                message="Bạn có chắc chắn muốn xóa bộ Flashcard này? Toàn bộ từ vựng đi kèm cũng sẽ bị xóa vĩnh viễn."
                onConfirm={executeDelete}
                onCancel={() => setConfirmModal({ isOpen: false, flashcardId: null })}
                loading={isDeleting}
            />

            <VisibilityToggleModal
                isOpen={visModal.isOpen}
                flashcard={visModal.flashcard}
                onConfirm={executeToggleVisibility}
                onCancel={() => setVisModal({ isOpen: false, flashcard: null })}
                loading={isToggling}
            />
        </div>
    );
};

export default FlashcardList;
