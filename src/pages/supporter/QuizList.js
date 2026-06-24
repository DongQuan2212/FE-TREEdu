// src/pages/supporter/QuizList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Eye, Edit2, Trash2, Plus, Clock, BarChart3, BookOpen,
    ChevronLeft, ChevronRight, Upload, X, FileText, Loader2, AlertTriangle
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { notify } from '../../utils/toastNotify'; // Tích hợp Toast Notify

const API_BASE = 'http://localhost:3001/api';

// ─── Component: Hộp thoại xác nhận xóa Custom ─────────────────────────────────

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

    // Modal Upload AI
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTopic, setUploadTopic] = useState('');
    const [uploadLevel, setUploadLevel] = useState('');
    const [uploadQuestionCount, setUploadQuestionCount] = useState(10);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

    // Modal xác nhận xóa Custom
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        quizId: null,
        title: '',
        message: ''
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

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
            notify.error('Không thể tải danh sách bài Quiz từ máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes(currentPage);
    }, [currentPage]);

    // Kích hoạt mở Modal xóa
    const handleDeleteClick = (id) => {
        setConfirmModal({
            isOpen: true,
            quizId: id,
            title: 'Xóa bài kiểm tra (Quiz)',
            message: 'Bạn có chắc chắn muốn xóa bài Quiz này? Toàn bộ câu hỏi và lịch sử làm bài của học viên liên quan sẽ bị xóa vĩnh viễn.'
        });
    };

    // Thực thi API xóa
    const executeDelete = async () => {
        const { quizId } = confirmModal;
        if (!quizId) return;

        setIsActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/${quizId}`, { method: 'DELETE' });
            if (res.ok) {
                notify.success('Đã xóa bài kiểm tra thành công!');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                fetchQuizzes(currentPage);
            } else {
                notify.error('Xóa thất bại, vui lòng thử lại sau!');
            }
        } catch (err) {
            console.error('Lỗi server khi xóa:', err);
            notify.error('Mất kết nối đến máy chủ!');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Upload file tạo quiz bằng AI
    const handleGenerateQuiz = async () => {
        if (!uploadFile) {
            setUploadMessage({ type: 'error', text: 'Vui lòng đính kèm file tài liệu!' });
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
                notify.success('AI đã tổng hợp và tạo Quiz thành công!');
                setIsUploadModalOpen(false);
                setUploadFile(null);
                fetchQuizzes(currentPage);
            } else {
                const errorText = result.message || 'Tạo quiz thất bại!';
                setUploadMessage({ type: 'error', text: errorText });
                notify.error(errorText);
            }
        } catch (err) {
            console.error('Lỗi upload AI:', err);
            setUploadMessage({ type: 'error', text: 'Lỗi kết nối đến Server AI!' });
            notify.error('Lỗi kết nối máy chủ khi phân tích file!');
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
            setUploadMessage({ type: '', text: '' });
        } else {
            setUploadMessage({ type: 'error', text: 'Chỉ hỗ trợ định dạng PDF, DOCX, TXT!' });
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
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Tạo từ File (AI)
                            </button>
                            <Link
                                to="/supporter/quizzes/create"
                                className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo thủ công
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tiêu đề, chủ đề..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white">
                                <option value="all">Tất cả chủ đề</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none bg-white">
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
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
                                <p className="text-gray-500">Không tìm thấy bài quiz nào</p>
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
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thời lượng</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Số câu</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {filteredQuizzes.map((quiz) => (
                                            <tr key={quiz.id} className="hover:bg-gray-50 transition text-sm">
                                                <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate" title={quiz.title}>
                                                    {quiz.title || '(Không có tiêu đề)'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                        {quiz.topic || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-medium">
                                                    <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                                                        Lvl {quiz.level}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center text-gray-600 font-medium">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{quiz.timer} phút</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-gray-700">
                                                    {quiz.questionCount || quiz.questions?.length || 0}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => navigate(`/supporter/quizzes/${quiz.id}`)}
                                                            className="p-2 hover:bg-blue-50 rounded text-blue-600 transition"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/supporter/quizzes/edit/${quiz.id}`)}
                                                            className="p-2 hover:bg-yellow-50 rounded text-yellow-600 transition"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(quiz.id)}
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

                                {totalPages > 1 && (
                                    <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                                        <p className="text-gray-600">
                                            Hiển thị {filteredQuizzes.length} trong {totalElements}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
                                                {currentPage + 1} / {totalPages}
                                            </span>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* MODAL XÁC NHẬN XÓA */}
                <ConfirmActionModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={executeDelete}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    loading={isActionLoading}
                />
            </div>

            {/* Modal Upload File tạo AI */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Upload className="w-6 h-6 text-blue-600" />
                                Tạo Quiz tự động bằng AI
                            </h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Khu vực kéo thả */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 text-center mb-5 hover:border-blue-400 transition group cursor-pointer"
                        >
                            {uploadFile ? (
                                <div className="flex items-center justify-center gap-3 text-gray-700">
                                    <FileText className="w-10 h-10 text-blue-600" />
                                    <div className="text-left truncate">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{uploadFile.name}</p>
                                        <p className="text-xs text-gray-500">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-700 font-semibold text-sm">Kéo thả tài liệu vào đây</p>
                                    <p className="text-xs text-gray-400 mt-1">hoặc</p>
                                    <label className="mt-2 inline-block">
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={(e) => {
                                                setUploadFile(e.target.files[0]);
                                                setUploadMessage({ type: '', text: '' });
                                            }}
                                            className="hidden"
                                        />
                                        <span className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 shadow-sm inline-block transition">
                                            Duyệt tệp
                                        </span>
                                    </label>
                                    <p className="text-[11px] text-gray-400 mt-3 font-medium">Định dạng hỗ trợ: PDF, DOCX, TXT</p>
                                </div>
                            )}
                        </div>

                        {/* Tùy chọn */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Chủ đề bài thi</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: ReactJS, IELTS..."
                                    value={uploadTopic}
                                    onChange={(e) => setUploadTopic(e.target.value)}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Cấp độ độ khó</label>
                                <select
                                    value={uploadLevel}
                                    onChange={(e) => setUploadLevel(e.target.value)}
                                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Tự động nhận diện</option>
                                    {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Số lượng câu hỏi trắc nghiệm
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="30"
                                value={uploadQuestionCount}
                                onChange={(e) => setUploadQuestionCount(Number(e.target.value))}
                                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Banner báo lỗi nội bộ */}
                        {uploadMessage.text && (
                            <div className={`mb-5 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{uploadMessage.text}</span>
                            </div>
                        )}

                        {/* Nút hành động */}
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                disabled={uploading}
                                className="px-5 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 text-sm hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={uploading || !uploadFile}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {uploading ? 'AI đang đọc tệp...' : 'Bắt đầu tạo Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList;
