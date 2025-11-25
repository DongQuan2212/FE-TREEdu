// src/pages/supporter/QuizList.js
import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Trash2, Plus, Clock, BarChart3, BookOpen, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { Link, useNavigate } from 'react-router-dom';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTopic, setFilterTopic] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [topics, setTopics] = useState([]);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();

    const fetchQuizzes = async (page = 0) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/quiz?page=${page}&size=6`);
            const result = await res.json();

            if (result.success && result.data?.content) {
                const data = result.data.content;
                setQuizzes(data);
                setCurrentPage(result.data.pageable.pageNumber);
                setTotalPages(result.data.totalPages);
                setTotalElements(result.data.totalElements);

                // Lấy danh sách topic duy nhất để làm filter
                const uniqueTopics = [...new Set(data.map(q => q.topic).filter(Boolean))];
                setTopics(uniqueTopics);
            }
        } catch (err) {
            console.error('Lỗi tải quiz:', err);
            alert('Không thể tải danh sách quiz!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes(currentPage);
    }, [currentPage]);

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa bài quiz này?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/quiz/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa thành công!');
                fetchQuizzes(currentPage);
            } else {
                alert('Xóa thất bại!');
            }
        } catch (err) {
            alert('Lỗi server!');
        }
    };

    // Lọc dữ liệu
    const filteredQuizzes = quizzes.filter(quiz => {
        const matchSearch = (quiz.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (quiz.topic || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchTopic = filterTopic === 'all' || quiz.topic === filterTopic;
        const matchLevel = filterLevel === 'all' || quiz.level === Number(filterLevel);
        return matchSearch && matchTopic && matchLevel;
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
                                <BarChart3 className="w-7 h-7" />
                                Quản lý Quiz
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">{totalElements} bài quiz</p>
                        </div>
                        <Link
                            to="/supporter/quizzes/create"
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo mới
                        </Link>
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc + Tìm kiếm */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                            >
                                <option value="all">Tất cả chủ đề</option>
                                {topics.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            <select
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </select>
                        </div>
                    </div>

                    {/* Table nhỏ gọn */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : filteredQuizzes.length === 0 ? (
                            <div className="p-12 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Không tìm thấy quiz nào</p>
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
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thời gian</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Câu hỏi</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {filteredQuizzes.map((quiz) => (
                                            <tr key={quiz.id} className="hover:bg-gray-50 transition text-sm">
                                                <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate">
                                                    {quiz.title || '(Không có tiêu đề)'}
                                                </td>
                                                <td className="px-5 py-4">
                            <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {quiz.topic}
                            </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {quiz.level}
                                                </td>
                                                <td className="px-5 py-4 text-center text-gray-600">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {quiz.timer}'
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center font-medium">
                                                    {quiz.questionCount || quiz.questions.length}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => navigate(`/supporter/quizzes/${quiz.id}`)} className="p-2 hover:bg-blue-50 rounded text-blue-600">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => navigate(`/supporter/quizzes/edit/${quiz.id}`)} className="p-2 hover:bg-yellow-50 rounded text-yellow-600">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(quiz.id)} className="p-2 hover:bg-red-50 rounded text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Phân trang nhỏ gọn */}
                                {totalPages > 1 && (
                                    <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                                        <p className="text-gray-600">
                                            Hiển thị {filteredQuizzes.length} trong {totalElements}
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

export default QuizList;
