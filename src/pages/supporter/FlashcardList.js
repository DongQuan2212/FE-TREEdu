// src/pages/supporter/FlashcardList.js
import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Trash2, Plus, BookOpen, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { Link, useNavigate } from 'react-router-dom';
import CreateFlashcardModal from '../../components/Supporter/CreateFlashcardModal';
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

    const navigate = useNavigate();

    const fetchFlashcards = async (page = 0) => {
        setLoading(true);
        try {
            // Gọi API phân trang (giả sử backend hỗ trợ ?page=&size=)
            const res = await fetch(`http://localhost:3001/flashcards?page=${page}&size=10`);
            const result = await res.json();

            if (result.success && result.data) {
                // Nếu backend trả phân trang giống Spring Data
                if (result.data.content) {
                    setFlashcards(result.data.content);
                    setCurrentPage(result.data.pageable.pageNumber);
                    setTotalPages(result.data.totalPages);
                    setTotalElements(result.data.totalElements);
                } else {
                    // Nếu backend chưa hỗ trợ phân trang → trả mảng trực tiếp
                    setFlashcards(result.data);
                    setTotalPages(Math.ceil(result.data.length / 10));
                    setTotalElements(result.data.length);
                }
            }
        } catch (err) {
            console.error('Lỗi tải flashcard:', err);
            alert('Không thể tải danh sách flashcard!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards(currentPage);
    }, [currentPage]);

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa bộ flashcard này?')) return;
        try {
            const res = await fetch(`http://localhost:3001/flashcards/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Xóa thành công!');
                fetchFlashcards(currentPage);
            } else {
                alert('Xóa thất bại!');
            }
        } catch (err) {
            alert('Lỗi server!');
        }
    };

    // Lọc dữ liệu
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
                            <div className="relative">
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
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
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
                                                            onClick={() => navigate(`/supporter/flashcards/${fc.id}`)}
                                                            className="p-2 hover:bg-blue-50 rounded text-blue-600"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/supporter/flashcards/edit/${fc.id}`)}
                                                            className="p-2 hover:bg-yellow-50 rounded text-yellow-600"
                                                            title="Sửa"
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
                                                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
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

export default FlashcardList;
