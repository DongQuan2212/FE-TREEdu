// src/pages/supporter/QuizList.js
import React, { useState, useEffect } from 'react';
import {
    Search, Edit2, Trash2, Plus, Clock, BarChart3, BookOpen,
    ChevronLeft, ChevronRight, Upload, X, FileText, Loader2, AlertTriangle
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { notify } from '../../utils/toastNotify';
import { quizAPI } from '../../config/api';

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
                    <button onClick={onCancel} disabled={loading}
                            className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
                        Hủy bỏ
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            className="flex-1 sm:flex-none px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition min-w-[140px] disabled:opacity-60 bg-red-600 hover:bg-red-700">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────
const QuizList = () => {
    const [quizzes, setQuizzes]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchTerm, setSearchTerm]     = useState('');
    const [filterTopic, setFilterTopic]   = useState('all');
    const [filterLevel, setFilterLevel]   = useState('all');
    const [topics, setTopics]             = useState([]);
    const [currentPage, setCurrentPage]   = useState(0);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Upload modal state
    const [isUploadModalOpen, setIsUploadModalOpen]     = useState(false);
    const [uploadFile, setUploadFile]                   = useState(null);
    const [uploadTopic, setUploadTopic]                 = useState('');
    const [uploadLevel, setUploadLevel]                 = useState('');
    const [uploadQuestionCount, setUploadQuestionCount] = useState(10);
    const [uploading, setUploading]                     = useState(false);
    const [uploadError, setUploadError]                 = useState('');

    // Delete modal state
    const [confirmModal, setConfirmModal]   = useState({ isOpen: false, quizId: null });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const navigate = useNavigate();

    // ── Fetch Data ───────────────────────────────────────────
    const fetchQuizzes = async (page = 0) => {
        setLoading(true);
        try {
            const res = await quizAPI.getAll(page, 6);
            const data = res.data;
            if (data.success && data.data?.content) {
                setQuizzes(data.data.content);
                setCurrentPage(data.data.pageable.pageNumber);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);
                const uniqueTopics = [...new Set(data.data.content.map(q => q.topic).filter(Boolean))];
                setTopics(uniqueTopics);
            }
        } catch (err) {
            console.error('Lỗi tải quiz:', err);
            notify.error('Không thể tải danh sách Quiz!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuizzes(currentPage); }, [currentPage]);

    // ── Delete Action ────────────────────────────────────────
    const handleDeleteClick = (id) => setConfirmModal({ isOpen: true, quizId: id });

    const executeDelete = async () => {
        setIsActionLoading(true);
        try {
            await quizAPI.delete(confirmModal.quizId);
            notify.success('Đã xóa bài kiểm tra thành công!');
            setConfirmModal({ isOpen: false, quizId: null });
            fetchQuizzes(currentPage);
        } catch (err) {
            const msg = err.response?.data?.message || 'Xóa thất bại!';
            notify.error(msg);
        } finally {
            setIsActionLoading(false);
        }
    };

    // ── Generate from file (AI) ──────────────────────────────
    const handleGenerateQuiz = async () => {
        if (!uploadFile) {
            setUploadError('Vui lòng đính kèm file tài liệu!');
            return;
        }

        setUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('file', uploadFile);
        if (uploadTopic)         formData.append('topic', uploadTopic);
        if (uploadLevel)         formData.append('level', uploadLevel);
        if (uploadQuestionCount) formData.append('questionCount', uploadQuestionCount);

        try {
            const res = await quizAPI.generateFromFile(formData);
            if (res.data.success) {
                notify.success('AI đã tạo Quiz thành công!');
                setIsUploadModalOpen(false);
                resetUploadForm();
                fetchQuizzes(currentPage);
            }
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setUploadError('AI xử lý quá lâu (>3 phút). File có thể quá lớn hoặc phức tạp, thử lại với file nhỏ hơn.');
            } else {
                const msg = err.response?.data?.message || 'Tạo quiz thất bại, thử lại sau!';
                setUploadError(msg);
            }
            notify.error('Tạo quiz thất bại!');
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setUploadFile(null);
        setUploadTopic('');
        setUploadLevel('');
        setUploadQuestionCount(10);
        setUploadError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        const allowed = ['pdf', 'docx', 'txt'];
        const ext = file?.name.split('.').pop().toLowerCase();
        if (file && allowed.includes(ext)) {
            setUploadFile(file);
            setUploadError('');
        } else {
            setUploadError('Chỉ hỗ trợ PDF, DOCX, TXT!');
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchSearch = (quiz.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (quiz.topic || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchTopic  = filterTopic === 'all' || quiz.topic === filterTopic;
        const matchLevel  = filterLevel === 'all' || quiz.level === Number(filterLevel);
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
                                <BarChart3 className="w-7 h-7" /> Quản lý Quiz
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">{totalElements} bài quiz</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsUploadModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm">
                                <Upload className="w-4 h-4" /> Tạo từ File (AI)
                            </button>
                            <Link to="/supporter/quizzes/create"
                                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm">
                                <Plus className="w-4 h-4" /> Tạo thủ công
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
                                <input type="text" placeholder="Tìm kiếm theo tiêu đề, chủ đề..."
                                       value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                            </div>
                            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white">
                                <option value="all">Tất cả chủ đề</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white">
                                <option value="all">Tất cả cấp độ</option>
                                {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
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
                                            {['Tiêu đề','Chủ đề','Cấp độ','Thời lượng','Số câu','Hành động'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {filteredQuizzes.map(quiz => (
                                            <tr key={quiz.id} className="hover:bg-gray-50 text-sm">
                                                <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate" title={quiz.title}>
                                                    {quiz.title || '(Không có tiêu đề)'}
                                                </td>
                                                <td className="px-5 py-4">
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                            {quiz.topic || '—'}
                                                        </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">Lvl {quiz.level}</span>
                                                </td>
                                                <td className="px-5 py-4 text-center text-gray-600">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{quiz.timer} phút</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-gray-700">
                                                    {quiz.questionCount ?? quiz.questions?.length ?? 0}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => navigate(`/supporter/quizzes/edit/${quiz.id}`)}
                                                                className="p-2 hover:bg-yellow-50 rounded text-yellow-600" title="Sửa">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(quiz.id)}
                                                                className="p-2 hover:bg-red-50 rounded text-red-600" title="Xóa">
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
                                        <p className="text-gray-600">Hiển thị {filteredQuizzes.length} trong {totalElements}</p>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0}
                                                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-xs font-medium">
                                                {currentPage+1} / {totalPages}
                                            </span>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages-1, p+1))} disabled={currentPage === totalPages-1}
                                                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                <ConfirmActionModal
                    isOpen={confirmModal.isOpen}
                    title="Xóa bài kiểm tra (Quiz)"
                    message="Bạn có chắc chắn muốn xóa bài Quiz này? Toàn bộ câu hỏi và lịch sử làm bài sẽ bị xóa vĩnh viễn."
                    onConfirm={executeDelete}
                    onCancel={() => setConfirmModal({ isOpen: false, quizId: null })}
                    loading={isActionLoading}
                />
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Upload className="w-6 h-6 text-blue-600" /> Tạo Quiz tự động bằng AI
                            </h2>
                            <button onClick={() => { setIsUploadModalOpen(false); resetUploadForm(); }}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dropzone */}
                        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                             className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 text-center mb-5 hover:border-blue-400 transition cursor-pointer">
                            {uploadFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-10 h-10 text-blue-600" />
                                    <div className="text-left truncate">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{uploadFile.name}</p>
                                        <p className="text-xs text-gray-500">{(uploadFile.size/1024/1024).toFixed(2)} MB</p>
                                    </div>
                                    <button onClick={() => setUploadFile(null)} className="ml-2 p-1 hover:bg-gray-100 rounded text-gray-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-700 font-semibold text-sm">Kéo thả tài liệu vào đây</p>
                                    <p className="text-xs text-gray-400 mt-1">hoặc</p>
                                    <label className="mt-2 inline-block">
                                        <input type="file" accept=".pdf,.docx,.txt"
                                               onChange={e => { setUploadFile(e.target.files[0]); setUploadError(''); }}
                                               className="hidden" />
                                        <span className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 inline-block">
                                            Duyệt tệp
                                        </span>
                                    </label>
                                    <p className="text-[11px] text-gray-400 mt-3">Định dạng: PDF, DOCX, TXT · Tối đa 10MB</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Chủ đề bài thi</label>
                                <input type="text" placeholder="Ví dụ: ReactJS, IELTS..."
                                       value={uploadTopic} onChange={e => setUploadTopic(e.target.value)}
                                       className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Cấp độ độ khó</label>
                                <select value={uploadLevel} onChange={e => setUploadLevel(e.target.value)}
                                        className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none bg-white">
                                    <option value="">Tự động nhận diện</option>
                                    {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Số lượng câu hỏi</label>
                            <input type="number" min="5" max="30" value={uploadQuestionCount}
                                   onChange={e => setUploadQuestionCount(Number(e.target.value))}
                                   className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        {uploading && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-semibold flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                AI đang đọc và phân tích tài liệu... Có thể mất 1-3 phút, vui lòng không đóng cửa sổ.
                            </div>
                        )}

                        {uploadError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {uploadError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button onClick={() => { setIsUploadModalOpen(false); resetUploadForm(); }} disabled={uploading}
                                    className="px-5 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50">
                                Hủy
                            </button>
                            <button onClick={handleGenerateQuiz} disabled={uploading || !uploadFile}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
                                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI đang xử lý...</> : 'Bắt đầu tạo Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList;
