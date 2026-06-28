// src/pages/admin/FlashcardList.js
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Edit2, Trash2, Plus, BookOpen,
    ChevronLeft, ChevronRight,
    ShieldCheck, User, AlertTriangle, Loader2,
    Globe, Lock, ToggleLeft, ToggleRight
} from 'lucide-react';
import Sidebar from '../../components/Admin/Sidebar';
import { useNavigate } from 'react-router-dom';
import CreateFlashcardModal from '../../components/Supporter/CreateFlashcardModal';
import { flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

// ─── ConfirmActionModal ────────────────────────────────────
const ConfirmActionModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmColor = 'red', loading }) => {
    if (!isOpen) return null;

    const colorStyles = {
        red:   { iconBg: 'bg-red-100',   iconText: 'text-red-600',   btn: 'bg-red-600 hover:bg-red-700'   },
        green: { iconBg: 'bg-green-100', iconText: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700' },
    };
    const s = colorStyles[confirmColor] || colorStyles.red;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${s.iconBg} ${s.iconText}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={loading}
                            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition disabled:opacity-50">
                        Hủy
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            className={`px-4 py-2 text-white rounded-lg font-medium text-sm transition flex items-center gap-2 disabled:opacity-50 ${s.btn}`}>
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{confirmLabel}</span>
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chuyển sang {nextLabel}?</h3>
                <p className="text-sm text-gray-500 mb-1 leading-relaxed px-2">
                    Bộ flashcard <span className="font-semibold text-gray-800">"{flashcard.title}"</span>
                </p>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
                    {isCurrentlyPublic
                        ? 'sẽ bị ẩn khỏi người dùng khác. Nếu đã có người học, thao tác này sẽ bị từ chối.'
                        : 'sẽ hiển thị công khai cho tất cả người dùng.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button onClick={onCancel} disabled={loading}
                            className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
                        Hủy
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            className={`flex-1 sm:flex-none px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-60 transition ${btnColor}`}>
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xử lý...' : `Chuyển sang ${nextLabel}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Badges ───────────────────────────────────────────────
const TypeBadge = ({ type }) => {
    if (type === 'SYSTEM') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> Hệ thống
        </span>
    );
    if (type === 'BY_MEMBER') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <User className="w-3 h-3" /> Thành viên
        </span>
    );
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{type || 'Khác'}</span>;
};

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

// ─── Main ──────────────────────────────────────────────────
const AdminFlashcardList = () => {
    const [flashcards, setFlashcards]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm]             = useState('');
    const [filterLevel, setFilterLevel]           = useState('all');
    const [filterType, setFilterType]             = useState('all');
    const [filterTopic, setFilterTopic]           = useState('all');
    const [filterVisibility, setFilterVisibility] = useState('all');

    // Client-side pagination
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(0);

    // Delete modal
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetId: null, loading: false });
    const [isDeleting, setIsDeleting]     = useState(false);

    // Visibility modal
    const [visModal, setVisModal]     = useState({ isOpen: false, flashcard: null });
    const [isToggling, setIsToggling] = useState(false);

    const navigate = useNavigate();

    // ── Fetch ─────────────────────────────────────────────
    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const res    = await flashcardAPI.getAllFlashcards();
            const result = res.data;
            if (result.success && result.data) {
                const list = Array.isArray(result.data)
                    ? result.data
                    : result.data.content ?? [];
                setFlashcards(list);
            }
        } catch (err) {
            console.error('Admin load flashcard error:', err);
            notify.error(
                err.response?.status === 403
                    ? 'Bạn không có quyền truy cập dữ liệu này!'
                    : 'Lỗi kết nối! Không thể tải danh sách Flashcard.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFlashcards(); }, []);

    // ── Derived ───────────────────────────────────────────
    const uniqueTopics = useMemo(() => {
        return [...new Set(flashcards.map(fc => fc.topic).filter(Boolean))];
    }, [flashcards]);

    const filtered = useMemo(() => flashcards.filter(fc => {
        const matchSearch =
            (fc.title       || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.topic       || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel      = filterLevel      === 'all' || fc.level === Number(filterLevel);
        const matchType       = filterType       === 'all' || fc.type === filterType;
        const matchTopic      = filterTopic      === 'all' || fc.topic === filterTopic;
        const matchVisibility = filterVisibility === 'all' || fc.visibility === filterVisibility;
        return matchSearch && matchLevel && matchType && matchTopic && matchVisibility;
    }), [flashcards, searchTerm, filterLevel, filterType, filterTopic, filterVisibility]);

    // Reset trang khi filter đổi
    useEffect(() => { setCurrentPage(0); }, [searchTerm, filterLevel, filterType, filterTopic, filterVisibility]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    // ── Delete ────────────────────────────────────────────
    const handleDelete = (id) => setConfirmModal({ isOpen: true, targetId: id, loading: false });

    const executeDelete = async () => {
        setIsDeleting(true);
        try {
            await flashcardAPI.deleteFlashcard(confirmModal.targetId);
            notify.success('Đã xóa Flashcard thành công!');
            setConfirmModal({ isOpen: false, targetId: null, loading: false });
            fetchFlashcards();
        } catch (err) {
            const msg = err.response?.data?.message || 'Xóa thất bại! Vui lòng thử lại sau.';
            notify.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Visibility toggle ─────────────────────────────────
    const handleVisibilityClick = (fc) => setVisModal({ isOpen: true, flashcard: fc });

    const executeToggleVisibility = async () => {
        const { flashcard } = visModal;
        const nextVisibility = flashcard.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
        setIsToggling(true);
        try {
            await flashcardAPI.changeVisibility(flashcard.id, nextVisibility);
            notify.success(
                nextVisibility === 'PUBLIC' ? 'Đã chuyển sang Công khai!' : 'Đã chuyển sang Riêng tư!'
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

    // ── Render ────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-64">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-7 h-7" /> Admin – Quản lý Flashcard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {filtered.length} / {flashcards.length} bộ flashcard
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
                                notify.success('Tạo flashcard mới thành công!');
                                fetchFlashcards();
                            }}
                        />
                    </div>
                </header>

                <main className="p-6">

                    {/* BỘ LỌC */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                                <input
                                    type="text"
                                    placeholder="Tìm tiêu đề, chủ đề, mô tả..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>

                            {/* Chủ đề */}
                            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer bg-white">
                                <option value="all">Tất cả chủ đề</option>
                                {uniqueTopics.map((topic, i) => (
                                    <option key={i} value={topic}>{topic}</option>
                                ))}
                            </select>

                            {/* Loại */}
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer bg-white">
                                <option value="all">Tất cả loại</option>
                                <option value="SYSTEM">Hệ thống</option>
                                <option value="BY_MEMBER">Thành viên</option>
                            </select>

                            {/* Cấp độ */}
                            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer bg-white">
                                <option value="all">Tất cả cấp độ</option>
                                {[1, 2, 3, 4, 5, 6].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>

                            {/* Visibility toggle buttons */}
                            <div className="flex gap-2 lg:col-span-1">
                                {[
                                    {value: 'all', label: 'Tất cả'},
                                    {value: 'PUBLIC', label: 'Công khai'},
                                    {value: 'PRIVATE', label: 'Riêng tư'},
                                ].map(opt => (
                                    <button key={opt.value} onClick={() => setFilterVisibility(opt.value)}
                                            className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition whitespace-nowrap ${
                                                filterVisibility === opt.value
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}>
                                        {opt.value === 'PUBLIC' && <Globe className="w-3.5 h-3.5"/>}
                                        {opt.value === 'PRIVATE' && <Lock className="w-3.5 h-3.5"/>}
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
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400"/>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-12 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4"/>
                                <p className="text-gray-500">Không tìm thấy flashcard phù hợp</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {['Tiêu đề', 'Chủ đề', 'Loại', 'Cấp độ', 'Số từ', 'Chế độ', 'Hành động'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                        {paginated.map(fc => (
                                            <tr key={fc.id} className="hover:bg-gray-50 text-sm">
                                                {/* Tiêu đề */}
                                                <td className="px-5 py-4 max-w-xs">
                                                    <div className="font-medium text-gray-900 truncate" title={fc.title}>
                                                        {fc.title || '(Không tiêu đề)'}
                                                    </div>
                                                    {fc.description && (
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{fc.description}</p>
                                                    )}
                                                </td>

                                                {/* Chủ đề */}
                                                <td className="px-5 py-4 text-gray-600">{fc.topic || '—'}</td>

                                                {/* Loại */}
                                                <td className="px-5 py-4">
                                                    <TypeBadge type={fc.type} />
                                                </td>

                                                {/* Cấp độ */}
                                                <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
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
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
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
                                                            onClick={() => navigate(`/admin/flashcard/edit/${fc.id}`)}
                                                            className="p-2 hover:bg-yellow-50 rounded text-yellow-600 transition"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(fc.id)}
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
                                            {Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} trong {filtered.length}
                                        </p>
                                        <div className="flex gap-1">
                                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                    disabled={currentPage === 0}
                                                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
                                                {currentPage + 1} / {totalPages}
                                            </span>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                                    disabled={currentPage === totalPages - 1}
                                                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition">
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
                onClose={() => setConfirmModal({ isOpen: false, targetId: null, loading: false })}
                onConfirm={executeDelete}
                title="Xác nhận xóa Flashcard"
                message="Cảnh báo: Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa flashcard này?"
                confirmLabel={isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                confirmColor="red"
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

export default AdminFlashcardList;
