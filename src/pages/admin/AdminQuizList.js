
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Edit2, Trash2, Upload, Clock, ChevronLeft, ChevronRight,
    X, FileText, Loader2, FileQuestion, AlertTriangle
} from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";

// 1. Import Notify
import { notify } from '../../utils/toastNotify';

// Component ConfirmActionModal dùng chung cho Xóa và Kích hoạt
const ConfirmActionModal = ({
                                isOpen,
                                onClose,
                                onConfirm,
                                title,
                                message,
                                confirmLabel,
                                confirmColor = 'red',
                                loading
                            }) => {
    if (!isOpen) return null;

    const colorStyles = {
        red: {
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            btn: 'bg-red-600 hover:bg-red-700'
        },
        green: {
            iconBg: 'bg-green-100',
            iconText: 'text-green-600',
            btn: 'bg-green-600 hover:bg-green-700'
        }
    };

    const currentStyle = colorStyles[confirmColor] || colorStyles.red;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${currentStyle.iconBg} ${currentStyle.iconText}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-white rounded-lg font-medium text-sm transition flex items-center gap-2 disabled:opacity-50 ${currentStyle.btn}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{confirmLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminQuizList = () => {
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

    // State quản lý Modal xác nhận hành động
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '', // 'delete' hoặc 'activate'
        targetId: null,
        loading: false
    });

    const navigate = useNavigate();

    const fetchQuizzes = useCallback(async (page = 0) => {
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
                setTotalPages(result.data.totalPages || 1);
                setTotalElements(result.data.totalElements || data.length);

                const uniqueTopics = [...new Set(data.map(q => q.topic).filter(Boolean))];
                setTopics(uniqueTopics);
            }
        } catch (err) {
            console.error('Lỗi tải quiz:', err);
            notify.error('Không thể tải danh sách quiz!');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterTopic, filterLevel]);

    useEffect(() => {
        fetchQuizzes(currentPage);
    }, [currentPage, fetchQuizzes]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, filterTopic, filterLevel]);

    // Thay đổi handleDelete — không còn async, chỉ set state mở modal
    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            targetId: id,
            loading: false
        });
    };

    const executeConfirmAction = async () => {
        const { type, targetId } = confirmModal;
        setConfirmModal(prev => ({ ...prev, loading: true }));

        try {
            if (type === 'delete') {
                await axiosInstance.delete(`/quiz/${targetId}`);
                notify.success('Xóa bài quiz thành công!');
            } else if (type === 'activate') {
                // Hỗ trợ trường hợp cần kích hoạt bài quiz trong tương lai
                // await axiosInstance.post(`/quiz/activate/${targetId}`);
                // notify.success('Kích hoạt bài quiz thành công!');
            }

            fetchQuizzes(currentPage);
            setConfirmModal({ isOpen: false, type: '', targetId: null, loading: false });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || (type === 'delete' ? 'Xóa thất bại!' : 'Kích hoạt thất bại!');
            notify.error(msg);
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleGenerateQuiz = async () => {
        if (!uploadFile) {
            notify.warning('Vui lòng chọn file trước!');
            return;
        }

        setUploading(true);

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
            });

            const result = await res.json();

            if (res.ok && result.success) {
                notify.success('Tạo quiz thành công từ file!');
                setIsUploadModalOpen(false);
                setUploadFile(null);
                fetchQuizzes(0);
            } else {
                notify.error(result.message || 'Tạo quiz thất bại!');
            }
        } catch (err) {
            console.error('Upload error:', err);
            notify.error('Lỗi kết nối server!');
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
                    notify.error('File quá lớn! Tối đa 10MB');
                } else {
                    setUploadFile(file);
                }
            } else {
                notify.error('Chỉ hỗ trợ PDF, DOCX, TXT!');
            }
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                notify.error('File quá lớn! Tối đa 10MB');
                e.target.value = '';
                return;
            }
            setUploadFile(file);
        }
    };

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

                {/* HEADER ĐỒNG BỘ */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileQuestion className="w-7 h-7 text-gray-900" />
                                Admin – Quản lý Quiz
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {totalElements} bài quiz
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Tạo từ File
                            </button>
                            <button
                                onClick={() => navigate('/admin/quiz/create')}
                                className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm mới
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Bộ lọc */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tiêu đề, chủ đề..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                            <select
                                value={filterTopic}
                                onChange={(e) => setFilterTopic(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer"
                            >
                                <option value="all">Tất cả chủ đề</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Cấp độ {l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : displayedQuizzes.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileQuestion className="w-16 h-16 mx-auto text-gray-300 mb-4" />
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
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thời gian</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Số câu</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                        {displayedQuizzes.map(quiz => (
                                            <tr key={quiz.id} className="hover:bg-gray-50 transition">
                                                <td className="px-5 py-4 font-medium max-w-md truncate">
                                                    {quiz.title || '(Không có tiêu đề)'}
                                                </td>
                                                <td className="px-5 py-4">
                                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {quiz.topic || '—'}
                                                        </span>
                                                </td>
                                                <td className="px-5 py-4 text-center font-medium">Level {quiz.level}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        {quiz.timer || '?'}p
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center font-medium">
                                                    {quiz.questionCount || quiz.questions?.length || 0}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/quiz/edit/${quiz.id}`)}
                                                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(quiz.id)}
                                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
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
                                    <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
                                        <p className="text-gray-600">
                                            Hiển thị {displayedQuizzes.length} / {totalElements}
                                        </p>
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
                                                disabled={currentPage >= totalPages - 1}
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

                {/* Modal Upload File */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Upload className="w-6 h-6" />
                                    Tạo Quiz từ File
                                </h2>
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-gray-900 transition cursor-pointer"
                            >
                                {uploadFile ? (
                                    <div className="flex items-center justify-center gap-4 text-gray-700">
                                        <FileText className="w-10 h-10 text-gray-900" />
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{uploadFile.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="font-medium text-gray-700 text-sm">Kéo & thả file vào đây</p>
                                        <label className="mt-3 inline-block">
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,.doc,.txt"
                                                onChange={handleFileInput}
                                                className="hidden"
                                            />
                                            <span className="text-blue-600 hover:underline cursor-pointer text-sm">
                                                hoặc chọn file từ máy
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-400 mt-2">Hỗ trợ: PDF, DOCX, TXT (Max 10MB)</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Chủ đề (tùy chọn)"
                                    value={uploadTopic}
                                    onChange={(e) => setUploadTopic(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                                <select
                                    value={uploadLevel}
                                    onChange={(e) => setUploadLevel(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                >
                                    <option value="">Level (Auto)</option>
                                    {[1,2,3,4,5,6].map(l => (
                                        <option key={l} value={l}>Level {l}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Số lượng câu hỏi (5 - 50)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={uploadQuestionCount}
                                    onChange={(e) => setUploadQuestionCount(Math.min(50, Math.max(5, Number(e.target.value))))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    disabled={uploading}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition text-gray-700"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleGenerateQuiz}
                                    disabled={uploading || !uploadFile}
                                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Tạo Quiz
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* <ConfirmActionModal /> thêm vào JSX — Title/Message linh hoạt thay đổi theo Type */}
            <ConfirmActionModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', targetId: null, loading: false })}
                onConfirm={executeConfirmAction}
                title={confirmModal.type === 'delete' ? 'Xác nhận xóa' : 'Xác nhận kích hoạt'}
                message={
                    confirmModal.type === 'delete'
                        ? 'Cảnh báo: Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa bài quiz này khỏi hệ thống?'
                        : 'Bạn có chắc chắn muốn kích hoạt lại bài kiểm tra này không?'
                }
                confirmLabel={confirmModal.type === 'delete' ? 'Xóa bài quiz' : 'Kích hoạt ngay'}
                confirmColor={confirmModal.type === 'delete' ? 'red' : 'green'}
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default AdminQuizList;
