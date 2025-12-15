// src/pages/supporter/QuizList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Eye, Edit2, Trash2, Plus, Clock, BarChart3, BookOpen,
    ChevronLeft, ChevronRight, Upload, X, FileText, Loader2
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001/api';

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

    // Modal upload
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTopic, setUploadTopic] = useState('');
    const [uploadLevel, setUploadLevel] = useState('');
    const [uploadQuestionCount, setUploadQuestionCount] = useState(10);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' }); // success / error

    const navigate = useNavigate();

    const fetchQuizzes = async (page = 0) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/quiz?page=${page}&size=6`);
            const result = await res.json();

            if (result.success && result.data?.content) {
                const data = result.data.content;
                setQuizzes(data);
                setCurrentPage(result.data.pageable.pageNumber);
                setTotalPages(result.data.totalPages);
                setTotalElements(result.data.totalElements);

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
            const res = await fetch(`${API_BASE}/quiz/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUploadMessage({ type: 'success', text: 'Xóa thành công!' });
                fetchQuizzes(currentPage);
            } else {
                setUploadMessage({ type: 'error', text: 'Xóa thất bại!' });
            }
        } catch (err) {
            setUploadMessage({ type: 'error', text: 'Lỗi server!' });
        }
    };

    // Upload file tạo quiz bằng AI
    const handleGenerateQuiz = async () => {
        if (!uploadFile) {
            setUploadMessage({ type: 'error', text: 'Vui lòng chọn file!' });
            return;
        }

        setUploading(true);
        setUploadMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('file', uploadFile);
        if (uploadTopic) formData.append('topic', uploadTopic);
        if (uploadLevel) formData.append('level', uploadLevel);
        if (uploadQuestionCount) formData.append('questionCount', uploadQuestionCount);

        try {
            const res = await fetch(`${API_BASE}/quiz/generate-from-file`, {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setUploadMessage({ type: 'success', text: 'Tạo quiz thành công từ file!' });
                setIsUploadModalOpen(false);
                setUploadFile(null);
                fetchQuizzes(currentPage); // Reload danh sách
            } else {
                setUploadMessage({ type: 'error', text: result.message || 'Tạo quiz thất bại!' });
            }
        } catch (err) {
            console.error('Lỗi upload:', err);
            setUploadMessage({ type: 'error', text: 'Lỗi kết nối server!' });
        } finally {
            setUploading(false);
        }
    };

    // Xử lý kéo thả file
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text'))) {
            setUploadFile(file);
        } else {
            setUploadMessage({ type: 'error', text: 'Chỉ hỗ trợ PDF, DOCX, TXT!' });
        }
    };

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
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-7 h-7" />
                                Quản lý Quiz
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">{totalElements} bài quiz</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Tạo từ File
                            </button>
                            <Link
                                to="/supporter/quizzes/create"
                                className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo mới
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc */}
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
                            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                                <option value="all">Tất cả chủ đề</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
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
                                                <td className="px-5 py-4 text-center">{quiz.level}</td>
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

                                {totalPages > 1 && (
                                    <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                                        <p className="text-gray-600">
                                            Hiển thị {filteredQuizzes.length} trong {totalElements}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
                                                {currentPage + 1} / {totalPages}
                                            </span>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
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

            {/* Modal Upload File */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Upload className="w-6 h-6" />
                                Tạo Quiz từ File
                            </h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Khu vực kéo thả */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-5 hover:border-gray-400 transition"
                        >
                            {uploadFile ? (
                                <div className="flex items-center justify-center gap-3 text-gray-700">
                                    <FileText className="w-10 h-10" />
                                    <div className="text-left">
                                        <p className="font-medium">{uploadFile.name}</p>
                                        <p className="text-xs text-gray-500">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-600 font-medium">Kéo thả file vào đây</p>
                                    <p className="text-sm text-gray-500 mt-1">hoặc</p>
                                    <label className="mt-3 inline-block">
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={(e) => setUploadFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium">
                                            Chọn file
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-3">Hỗ trợ: PDF, DOCX, TXT</p>
                                </div>
                            )}
                        </div>

                        {/* Tùy chọn */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <input
                                type="text"
                                placeholder="Chủ đề (tùy chọn)"
                                value={uploadTopic}
                                onChange={(e) => setUploadTopic(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <select
                                value={uploadLevel}
                                onChange={(e) => setUploadLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Cấp độ (tự động)</option>
                                {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số câu hỏi mong muốn (mặc định 10)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="30"
                                value={uploadQuestionCount}
                                onChange={(e) => setUploadQuestionCount(Number(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Thông báo */}
                        {uploadMessage.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {uploadMessage.text}
                            </div>
                        )}

                        {/* Nút hành động */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                disabled={uploading}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={uploading || !uploadFile}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                            >
                                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {uploading ? 'Đang tạo...' : 'Tạo Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList;
