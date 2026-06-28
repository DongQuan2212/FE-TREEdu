// src/pages/admin/AdminQuizCreator.js
import React, { useState } from 'react';
import {
    Plus, Trash2, Save, ArrowLeft, AlertCircle, CheckCircle2, Layers,
    AlertTriangle, Loader2
} from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../config/axiosConfig";
import { notify } from '../../utils/toastNotify';

// Component ConfirmActionModal dùng chung cho các hành động cần cảnh báo xác nhận
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

const AdminQuizCreator = () => {
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState({
        title: '',
        topic: '',
        level: 1,
        timer: 60,
        questions: [{
            questionId: Date.now().toString(),
            content: '',
            explanation: '',
            options: [
                { answerId: '1', content: '', isCorrect: true },
                { answerId: '2', content: '', isCorrect: false },
                { answerId: '3', content: '', isCorrect: false },
                { answerId: '4', content: '', isCorrect: false }
            ]
        }]
    });

    const [selectedIdx, setSelectedIdx] = useState(0);
    const [creating, setCreating] = useState(false);

    // State quản lý hành động Modal xác nhận
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '', // 'delete_question'
        targetId: null, // Lưu index câu hỏi cần xóa tạm thời
        loading: false
    });

    const updateQuizInfo = (field, value) => {
        setQuiz(prev => ({ ...prev, [field]: value }));
    };

    const updateCurrentQuestion = (field, value) => {
        setQuiz(prev => {
            const updated = [...prev.questions];
            updated[selectedIdx][field] = value;
            return { ...prev, questions: updated };
        });
    };

    const updateOption = (oIdx, content) => {
        setQuiz(prev => {
            const updated = [...prev.questions];
            updated[selectedIdx].options[oIdx].content = content;
            return { ...prev, questions: updated };
        });
    };

    const selectCorrect = (oIdx) => {
        setQuiz(prev => {
            const updated = [...prev.questions];
            updated[selectedIdx].options = updated[selectedIdx].options.map((opt, i) => ({
                ...opt,
                isCorrect: i === oIdx
            }));
            return { ...prev, questions: updated };
        });
    };

    const addQuestion = () => {
        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, {
                questionId: Date.now().toString() + Math.random(),
                content: '',
                explanation: '',
                options: [
                    { answerId: '1', content: '', isCorrect: true },
                    { answerId: '2', content: '', isCorrect: false },
                    { answerId: '3', content: '', isCorrect: false },
                    { answerId: '4', content: '', isCorrect: false }
                ]
            }]
        }));
        setSelectedIdx(quiz.questions.length);
    };

    // Thay đổi deleteQuestion — chỉ kiểm tra điều kiện và mở Modal xác nhận
    const deleteQuestion = (idx) => {
        if (quiz.questions.length <= 1) {
            notify.warning('Phải giữ ít nhất 1 câu hỏi!');
            return;
        }
        setConfirmModal({
            isOpen: true,
            type: 'delete_question',
            targetId: idx,
            loading: false
        });
    };

    // Khối xử lý cắt mảng dữ liệu sau khi bấm Đồng ý trên Modal
    const executeConfirmAction = () => {
        const { type, targetId } = confirmModal;

        if (type === 'delete_question') {
            setQuiz(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== targetId)
            }));

            // Đồng bộ lại logic tính toán dịch chuyển vị trí trang câu hỏi hiện tại
            if (selectedIdx >= quiz.questions.length - 1) {
                setSelectedIdx(Math.max(0, quiz.questions.length - 2));
            } else if (selectedIdx > targetId) {
                setSelectedIdx(selectedIdx - 1);
            }
            notify.success('Đã gỡ câu hỏi khỏi danh sách tạm thời!');
        }

        // Đóng modal gọn gàng
        setConfirmModal({ isOpen: false, type: '', targetId: null, loading: false });
    };

    const createQuiz = async () => {
        if (!quiz.title.trim() || !quiz.topic.trim()) {
            notify.warning('Vui lòng nhập đầy đủ tiêu đề và chủ đề!');
            return;
        }

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            if (!q.content.trim()) {
                notify.warning(`Câu hỏi số ${i + 1} chưa có nội dung!`);
                setSelectedIdx(i);
                return;
            }
            if (q.options.some(o => !o.content.trim())) {
                notify.warning(`Câu hỏi số ${i + 1} có đáp án trống!`);
                setSelectedIdx(i);
                return;
            }
            if (!q.options.some(o => o.isCorrect)) {
                notify.warning(`Câu hỏi số ${i + 1} chưa chọn đáp án đúng!`);
                setSelectedIdx(i);
                return;
            }
        }

        setCreating(true);
        try {
            await axiosInstance.post('/quiz', quiz);
            notify.success('Tạo bài Quiz thành công! 🎉');
            navigate('/admin/quiz');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Lỗi khi tạo quiz!';
            notify.error(msg);
        } finally {
            setCreating(false);
        }
    };

    const currentQ = quiz.questions[selectedIdx] || { content: '', options: [], explanation: '' };
    const filledCount = quiz.questions.filter(q =>
        q.content.trim() && q.options.every(o => o.content.trim())
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/quiz')}
                                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                                title="Quay lại danh sách"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tạo Quiz Mới</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Thiết kế bài kiểm tra trắc nghiệm
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={createQuiz}
                            disabled={creating}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm disabled:opacity-70"
                        >
                            {creating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Hoàn tất & Lưu
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto w-full">

                    {/* SECTION: THÔNG TIN CHUNG */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-gray-700" />
                            Thông tin cấu hình
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={quiz.title}
                                    onChange={e => updateQuizInfo('title', e.target.value)}
                                    placeholder="Ví dụ: Kiểm tra ngữ pháp bài 1"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Chủ đề <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={quiz.topic}
                                    onChange={e => updateQuizInfo('topic', e.target.value)}
                                    placeholder="Ví dụ: Grammar, Vocabulary..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Cấp độ</label>
                                <select
                                    value={quiz.level}
                                    onChange={e => updateQuizInfo('level', Number(e.target.value))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none transition cursor-pointer"
                                >
                                    {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Thời gian (phút)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="180"
                                    value={quiz.timer}
                                    onChange={e => updateQuizInfo('timer', Number(e.target.value))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: EDITOR (SPLIT VIEW) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Cột Trái: Soạn thảo câu hỏi */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono">
                                            {selectedIdx + 1}
                                        </span>
                                        Nội dung câu hỏi
                                    </h2>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                                        <Layers size={12}/>
                                        Đã điền: <span className="text-gray-900 font-bold">{filledCount}/{quiz.questions.length}</span>
                                    </span>
                                </div>

                                <textarea
                                    placeholder="Nhập nội dung câu hỏi tại đây..."
                                    value={currentQ.content}
                                    onChange={e => updateCurrentQuestion('content', e.target.value)}
                                    rows="3"
                                    className="w-full text-base mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none transition"
                                />

                                <div className="space-y-3 flex-1">
                                    {currentQ.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            onClick={() => selectCorrect(i)}
                                            className={`group relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer select-none
                                                ${opt.isCorrect
                                                ? 'border-lime-500 bg-lime-50 ring-1 ring-lime-500 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                                                ${opt.isCorrect ? 'border-lime-600 bg-lime-600 text-white' : 'border-gray-400 bg-white'}`}>
                                                {opt.isCorrect && <CheckCircle2 size={12} />}
                                            </div>

                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + i)}`}
                                                    value={opt.content}
                                                    onChange={e => updateOption(i, e.target.value)}
                                                    className={`w-full bg-transparent outline-none text-sm font-medium placeholder-gray-400 ${opt.isCorrect ? 'text-gray-900' : 'text-gray-700'}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>

                                            <div className="absolute top-2 right-2 text-xs font-bold text-gray-300 group-hover:text-gray-400">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Giải thích đáp án (Optional)</label>
                                    <textarea
                                        placeholder="Nhập giải thích chi tiết cho người dùng sau khi xem kết quả..."
                                        value={currentQ.explanation || ''}
                                        onChange={e => updateCurrentQuestion('explanation', e.target.value)}
                                        rows="2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none text-sm text-gray-600 bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cột Phải: Navigation & Tools */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Danh sách câu hỏi</h3>
                                    <button
                                        onClick={addQuestion}
                                        className="text-xs flex items-center gap-1 bg-gray-900 text-white px-2.5 py-1.5 rounded hover:bg-black transition shadow-sm"
                                    >
                                        <Plus size={14} /> Thêm
                                    </button>
                                </div>

                                <div className="grid grid-cols-5 gap-2 mb-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    {quiz.questions.map((q, i) => {
                                        const isFilled = q.content.trim() && q.options.every(o => o.content.trim());
                                        const isActive = i === selectedIdx;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedIdx(i)}
                                                className={`aspect-square rounded-lg font-bold text-sm transition-all flex items-center justify-center border
                                                    ${isActive
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                                                    : isFilled
                                                        ? 'bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-200'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => deleteQuestion(selectedIdx)}
                                        disabled={quiz.questions.length <= 1}
                                        className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa câu hiện tại
                                    </button>

                                    {quiz.questions.length <= 1 && (
                                        <p className="text-[10px] text-center text-gray-400 italic mt-2">
                                            Bài quiz cần tối thiểu 1 câu hỏi
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal cảnh báo xác nhận xóa câu hỏi */}
            <ConfirmActionModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', targetId: null, loading: false })}
                onConfirm={executeConfirmAction}
                title="Xác nhận gỡ câu hỏi"
                message={`Bạn có thực sự muốn loại bỏ Câu hỏi số ${Number(confirmModal.targetId) + 1} ra khỏi tiến trình tạo mới này? Toàn bộ nội dung vừa soạn thảo của câu hỏi này sẽ bị xóa.`}
                confirmLabel="Xóa câu hỏi"
                confirmColor="red"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default AdminQuizCreator;
