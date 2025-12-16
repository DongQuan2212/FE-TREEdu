// src/pages/admin/QuizManagement.js  (hoặc đường dẫn của bạn)
import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Edit2, Trash2, Upload, Clock, ChevronLeft, ChevronRight,
    X, FileText, Loader2, FileQuestion
} from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar"; // Đổi thành SupporterSidebar nếu cần
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTopic, setFilterTopic] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [topics, setTopics] = useState([]);
    const API_BASE = 'http://localhost:3001/api';

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
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    const fetchQuizzes = async (page = 0) => {
        try {
            setLoading(true);
            const params = { page, size: 10 };
            if (searchTerm.trim()) params.search = searchTerm.trim();
            if (filterTopic !== 'all') params.topic = filterTopic;
            if (filterLevel !== 'all') params.level = filterLevel;

            const response = await axiosInstance.get("/quiz", { params });
            const result = response.data;

            if (result.success && result.data) {
                const data = result.data.content || result.data;
                setQuizzes(data);
                setCurrentPage(result.data.pageable?.pageNumber || page);
                setTotalPages(result.data.totalPages || 1);
                setTotalElements(result.data.totalElements || data.length);

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

    // Khi filter thay đổi → reset về trang 1
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, filterTopic, filterLevel]);

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa bài quiz này?')) return;

        try {
            await axiosInstance.delete(`/quiz/${id}`);
            setUploadMessage({ type: 'success', text: 'Xóa thành công!' });
            fetchQuizzes(currentPage);
        } catch (err) {
            const msg = err.response?.data?.message || 'Xóa thất bại!';
            setUploadMessage({ type: 'error', text: msg });
        }
    };

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
        if (uploadQuestionCount) {
            formData.append('questionCount', uploadQuestionCount);
        }

        try {
            const res = await fetch(`${API_BASE}/quiz/generate-from-file`, {
                method: 'POST',
                body: formData,
                // ❌ KHÔNG headers
                // ❌ KHÔNG Content-Type
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setUploadMessage({
                    type: 'success',
                    text: 'Tạo quiz thành công từ file!'
                });
            } else {
                setUploadMessage({
                    type: 'error',
                    text: result.message || 'Tạo quiz thất bại!'
                });
            }
        } catch (err) {
            console.error('Upload error:', err);
            setUploadMessage({
                type: 'error',
                text: 'Lỗi kết nối server!'
            });
        } finally {
            setUploading(false);
        }
    };


    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (allowed.includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.pdf') || file.name.endsWith('.txt')) {
                if (file.size > 10 * 1024 * 1024) {
                    setUploadMessage({ type: 'error', text: 'File quá lớn! Tối đa 10MB' });
                } else {
                    setUploadFile(file);
                }
            } else {
                setUploadMessage({ type: 'error', text: 'Chỉ hỗ trợ PDF, DOCX, TXT!' });
            }
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setUploadMessage({ type: 'error', text: 'File quá lớn! Tối đa 10MB' });
                e.target.value = '';
                return;
            }
            setUploadFile(file);
        }
    };

    // Lọc client-side cho search + filter (vì backend chưa hỗ trợ search đầy đủ)
    const displayedQuizzes = quizzes.filter(quiz => {
        const matchSearch = searchTerm === '' ||
            (quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (quiz.topic?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchTopic = filterTopic === 'all' || quiz.topic === filterTopic;
        const matchLevel = filterLevel === 'all' || quiz.level === Number(filterLevel);
        return matchSearch && matchTopic && matchLevel;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FileQuestion className="w-8 h-8 text-lime-600" />
                                Quản lý bài Quiz
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Tổng cộng <strong>{totalElements}</strong> bài quiz
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-gray-800 hover:bg-black text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <Upload className="w-5 h-5" />
                                Tạo từ File
                            </button>
                            <button
                                onClick={() => navigate('/admin/quiz/create')}
                                className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm bài Quiz mới
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto">
                    {/* Bộ lọc */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tiêu đề, chủ đề..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                                />
                            </div>
                            <select
                                value={filterTopic}
                                onChange={(e) => setFilterTopic(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                            >
                                <option value="all">Tất cả chủ đề</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Cấp độ {l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-16 text-center">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-lime-600"></div>
                                <p className="mt-4 text-gray-600">Đang tải danh sách quiz...</p>
                            </div>
                        ) : displayedQuizzes.length === 0 ? (
                            <div className="p-16 text-center">
                                <FileQuestion className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">Không tìm thấy bài quiz nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tiêu đề</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Chủ đề</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Cấp độ</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Số câu</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {displayedQuizzes.map(quiz => (
                                            <tr key={quiz.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium max-w-md truncate">
                                                    {quiz.title || '(Không có tiêu đề)'}
                                                </td>
                                                <td className="px-6 py-4">
                                                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {quiz.topic || '—'}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">{quiz.level}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        {quiz.timer || '?'} phút
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    {quiz.questionCount || quiz.questions?.length || 0}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => navigate(`/admin/quiz/edit/${quiz.id}`)}
                                                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(quiz.id)}
                                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
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

                                {totalPages > 1 && (
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <p className="text-sm text-gray-700">
                                            Hiển thị {displayedQuizzes.length} / {totalElements} bài quiz
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                disabled={currentPage === 0}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="px-4 py-2 text-sm font-medium">
                                                Trang {currentPage + 1} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                                disabled={currentPage >= totalPages - 1}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* Modal Upload File - giống hệt QuizList.js */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <Upload className="w-8 h-8 text-gray-800" />
                                    Tạo Quiz từ File
                                </h2>
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drag & Drop Area */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center mb-6 hover:border-gray-400 transition"
                            >
                                {uploadFile ? (
                                    <div className="flex items-center justify-center gap-4 text-gray-700">
                                        <FileText className="w-12 h-12" />
                                        <div className="text-left">
                                            <p className="font-medium">{uploadFile.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-lg font-medium text-gray-700">Kéo & thả file vào đây</p>
                                        <p className="text-sm text-gray-500 mt-2">hoặc</p>
                                        <label className="mt-4 inline-block">
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,.doc,.txt"
                                                onChange={handleFileInput}
                                                className="hidden"
                                            />
                                            <span className="px-6 py-3 bg-gray-800 hover:bg-black text-white rounded-lg cursor-pointer font-medium transition">
                                                Chọn file
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-4">Hỗ trợ: PDF, DOCX, TXT (tối đa 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* Tùy chọn */}
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <input
                                    type="text"
                                    placeholder="Chủ đề (khuyến khích)"
                                    value={uploadTopic}
                                    onChange={(e) => setUploadTopic(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                                />
                                <select
                                    value={uploadLevel}
                                    onChange={(e) => setUploadLevel(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                                >
                                    <option value="">Cấp độ (tự động)</option>
                                    {[1,2,3,4,5,6].map(l => (
                                        <option key={l} value={l}>Cấp độ {l}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số câu hỏi mong muốn (mặc định 10, tối đa 50)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={uploadQuestionCount}
                                    onChange={(e) => setUploadQuestionCount(Math.min(50, Math.max(5, Number(e.target.value))))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                                />
                            </div>

                            {/* Thông báo */}
                            {uploadMessage.text && (
                                <div className={`mb-5 p-4 rounded-lg text-sm font-medium text-center ${
                                    uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {uploadMessage.text}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    disabled={uploading}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleGenerateQuiz}
                                    disabled={uploading || !uploadFile}
                                    className="px-8 py-3 bg-lime-600 hover:bg-lime-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Tạo Quiz
                                        </>
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

export default QuizManagement;
