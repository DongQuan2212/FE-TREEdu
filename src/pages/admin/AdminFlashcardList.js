// src/pages/admin/FlashcardList.js
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Edit2,
    Trash2,
    Plus,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    User,
    ShieldCheck
} from 'lucide-react';
import Sidebar from '../../components/Admin/Sidebar';
import { useNavigate } from 'react-router-dom';
import CreateFlashcardModal from '../../components/Supporter/CreateFlashcardModal';
import { flashcardAPI } from '../../config/api';

// 1. IMPORT Helper Notify thay vì thư viện gốc
import { notify } from '../../utils/toastNotify';

const AdminFlashcardList = () => {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);

    // State bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterTopic, setFilterTopic] = useState('all');

    const [showCreateModal, setShowCreateModal] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();

    const fetchFlashcards = async (page = 0) => {
        setLoading(true);
        try {
            const res = await flashcardAPI.getAllFlashcards({
                params: { page, size: 10 },
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
            console.error('Admin load flashcard error:', err);
            // 2. Sử dụng notify từ utils
            if (err.response?.status === 403) {
                notify.error('Bạn không có quyền truy cập dữ liệu này!');
            } else {
                notify.error('Lỗi kết nối! Không thể tải danh sách Flashcard.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards(currentPage);
    }, [currentPage]);

    const uniqueTopics = useMemo(() => {
        const topics = flashcards.map(fc => fc.topic).filter(Boolean);
        return [...new Set(topics)];
    }, [flashcards]);

    const handleDelete = async (id) => {
        if (!window.confirm('Cảnh báo: Hành động này không thể hoàn tác.\nBạn chắc chắn muốn xóa?')) return;

        try {
            await flashcardAPI.deleteFlashcard(id);

            // 2. Sử dụng notify
            notify.success('Đã xóa Flashcard thành công!');

            fetchFlashcards(currentPage);
        } catch (err) {
            console.error(err);
            // 2. Sử dụng notify
            if (err.response?.status === 403) {
                notify.error('Bạn không có quyền xóa Flashcard này!');
            } else {
                notify.error('Xóa thất bại! Vui lòng thử lại sau.');
            }
        }
    };

    // ... Logic lọc
    const filteredFlashcards = flashcards.filter(fc => {
        const matchSearch =
            (fc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel = filterLevel === 'all' || fc.level === Number(filterLevel);
        const matchType = filterType === 'all' || fc.type === filterType;
        const matchTopic = filterTopic === 'all' || fc.topic === filterTopic;

        return matchSearch && matchLevel && matchType && matchTopic;
    });

    const renderTypeBadge = (type) => {
        if (type === 'SYSTEM') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <ShieldCheck className="w-3 h-3" />
                    Hệ thống
                </span>
            );
        } else if (type === 'BY_MEMBER') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <User className="w-3 h-3" />
                    Thành viên
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {type || 'Khác'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            {/* 3. KHÔNG CÒN <ToastContainer /> Ở ĐÂY NỮA */}

            <div className="flex-1 ml-64">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-7 h-7" />
                                Admin – Quản lý Flashcard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {totalElements} bộ flashcard
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo mới
                        </button>

                        <CreateFlashcardModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={() => {
                                setShowCreateModal(false);
                                notify.success('Tạo flashcard mới thành công!'); // 2. Sử dụng notify
                                fetchFlashcards(currentPage);
                            }}
                        />
                    </div>
                </header>

                <main className="p-6">
                    {/* Filter Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>

                            <select
                                value={filterTopic}
                                onChange={e => setFilterTopic(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer"
                            >
                                <option value="all">Tất cả chủ đề</option>
                                {uniqueTopics.map((topic, index) => (
                                    <option key={index} value={topic}>{topic}</option>
                                ))}
                            </select>

                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer"
                            >
                                <option value="all">Tất cả người tạo</option>
                                <option value="SYSTEM">Hệ thống</option>
                                <option value="BY_MEMBER">Thành viên</option>
                            </select>

                            <select
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : filteredFlashcards.length === 0 ? (
                            <div className="p-12 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Không tìm thấy flashcard phù hợp</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tiêu đề</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Chủ đề</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Người tạo</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Cấp độ</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Số từ</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                        {filteredFlashcards.map(fc => (
                                            <tr key={fc.id} className="hover:bg-gray-50 text-sm">
                                                <td className="px-5 py-4 font-medium">{fc.title || '(Không tiêu đề)'}</td>
                                                <td className="px-5 py-4">{fc.topic || '—'}</td>
                                                <td className="px-5 py-4 text-center">{renderTypeBadge(fc.type)}</td>
                                                <td className="px-5 py-4 text-center">Level {fc.level}</td>
                                                <td className="px-5 py-4 text-center">{fc.wordCount}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/flashcard/edit/${fc.id}`)}
                                                            className="p-2 hover:bg-yellow-50 rounded text-yellow-600"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(fc.id)}
                                                            className="p-2 hover:bg-red-50 rounded text-red-600"
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
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="px-5 py-4 border-t flex items-center justify-between text-sm">
                                        <p className="text-gray-600">Hiển thị {filteredFlashcards.length} / {totalElements}</p>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                disabled={currentPage === 0}
                                                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs">
                                                {currentPage + 1} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                                disabled={currentPage === totalPages - 1}
                                                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
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
        </div>
    );
};

export default AdminFlashcardList;
