import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus, Trash2, Save, ArrowLeft,
    AlertCircle, CheckCircle2, Circle, Clock, Layers
} from 'lucide-react';

import Sidebar from "../../components/Admin/Sidebar";
import axiosInstance from "../../config/axiosConfig";
import { notify } from '../../utils/toastNotify';

const AdminQuizEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);

    const [quiz, setQuiz] = useState({
        title: '',
        topic: '',
        level: 1,
        timer: 60,
        questions: []
    });

    // --- Default Question Template ---
    const createNewQuestion = () => ({
        questionId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: '',
        explanation: '',
        options: [
            { answerId: '1', content: '', isCorrect: true },
            { answerId: '2', content: '', isCorrect: false },
            { answerId: '3', content: '', isCorrect: false },
            { answerId: '4', content: '', isCorrect: false }
        ]
    });

    // --- Fetch Data ---
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/quiz/edit/${id}`);

                if (response.data?.success && response.data?.data) {
                    const data = response.data.data;

                    // Format data consistency
                    const formattedQuestions = (data.questions || []).map(q => ({
                        questionId: q.questionId,
                        content: q.content || '',
                        explanation: q.explanation || '',
                        options: (q.options || []).map(opt => ({
                            answerId: opt.answerId,
                            content: opt.content || '',
                            isCorrect: opt.isCorrect === true
                        }))
                    }));

                    setQuiz({
                        title: data.title || '',
                        topic: data.topic || '',
                        level: data.level || 1,
                        timer: data.timer || 60,
                        questions: formattedQuestions.length > 0 ? formattedQuestions : [createNewQuestion()]
                    });
                } else {
                    notify.error('Không tìm thấy dữ liệu bài thi!');
                    navigate('/admin/quiz');
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                notify.error('Lỗi khi tải bài thi!');
                navigate('/admin/quiz');
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id, navigate]);

    // --- Logic Handlers ---

    // 1. Update Quiz Info (Title, Topic, etc.)
    const handleInfoChange = (field, value) => {
        setQuiz(prev => ({ ...prev, [field]: value }));
    };

    // 2. Question Navigation & Management
    const handleAddQuestion = () => {
        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, createNewQuestion()]
        }));
        // Tự động chuyển đến câu mới tạo
        setTimeout(() => setSelectedIdx(quiz.questions.length), 50);
    };

    const handleDeleteQuestion = () => {
        if (quiz.questions.length <= 1) {
            notify.warning('Bài thi cần ít nhất 1 câu hỏi!');
            return;
        }

        const newQuestions = quiz.questions.filter((_, index) => index !== selectedIdx);
        setQuiz(prev => ({ ...prev, questions: newQuestions }));

        // Điều chỉnh index nếu xóa câu cuối
        if (selectedIdx >= newQuestions.length) {
            setSelectedIdx(Math.max(0, newQuestions.length - 1));
        }
    };

    // 3. Current Question Editing
    const handleQuestionContentChange = (field, value) => {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[selectedIdx] = {
            ...updatedQuestions[selectedIdx],
            [field]: value
        };
        setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleOptionChange = (optIndex, value) => {
        const updatedQuestions = [...quiz.questions];
        const currentQ = updatedQuestions[selectedIdx];

        currentQ.options[optIndex].content = value;
        setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleSetCorrectOption = (optIndex) => {
        const updatedQuestions = [...quiz.questions];
        const currentQ = updatedQuestions[selectedIdx];

        currentQ.options = currentQ.options.map((opt, idx) => ({
            ...opt,
            isCorrect: idx === optIndex
        }));

        setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // --- Validation & Save ---
    const validateQuiz = () => {
        if (!quiz.title.trim()) return { valid: false, msg: 'Thiếu tiêu đề bài thi!' };
        if (!quiz.topic.trim()) return { valid: false, msg: 'Thiếu chủ đề bài thi!' };

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            if (!q.content.trim()) {
                setSelectedIdx(i);
                return { valid: false, msg: `Câu hỏi số ${i + 1} chưa có nội dung!` };
            }
            // Check options empty
            if (q.options.some(o => !o.content.trim())) {
                setSelectedIdx(i);
                return { valid: false, msg: `Câu hỏi số ${i + 1} có đáp án bị trống!` };
            }
            // Check correct answer selected (Safety check)
            if (!q.options.some(o => o.isCorrect)) {
                setSelectedIdx(i);
                return { valid: false, msg: `Câu hỏi số ${i + 1} chưa chọn đáp án đúng!` };
            }
        }
        return { valid: true };
    };

    const handleSave = async () => {
        const check = validateQuiz();
        if (!check.valid) {
            notify.warning(check.msg);
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.put(`/quiz/${id}`, quiz);
            notify.success('Cập nhật bài thi thành công!');
            navigate('/admin/quiz');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Không thể lưu bài thi, vui lòng thử lại!';
            notify.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // --- Render Helpers ---
    const currentQuestion = quiz.questions[selectedIdx] || createNewQuestion();

    // Tính toán số câu đã hoàn thành để hiển thị progress
    const completedCount = useMemo(() => {
        return quiz.questions.filter(q =>
            q.content.trim() && q.options.every(o => o.content.trim())
        ).length;
    }, [quiz.questions]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
                        <span className="text-gray-500 text-sm font-medium">Đang tải dữ liệu...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">

                {/* --- Header --- */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/quiz')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa bài thi</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">{id}</span>
                                <span>•</span>
                                <span>{quiz.questions.length} câu hỏi</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                </header>

                <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* --- Left Column: Settings & Question List (4 cols) --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. General Settings Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Layers size={16} /> Thông tin chung
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tiêu đề</label>
                                    <input
                                        type="text"
                                        value={quiz.title}
                                        onChange={e => handleInfoChange('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="Nhập tên bài thi..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Chủ đề</label>
                                    <input
                                        type="text"
                                        value={quiz.topic}
                                        onChange={e => handleInfoChange('topic', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="VD: Grammar, TOEIC..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Level</label>
                                        <select
                                            value={quiz.level}
                                            onChange={e => handleInfoChange('level', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                                            <Clock size={12}/> Thời gian (phút)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quiz.timer}
                                            onChange={e => handleInfoChange('timer', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Question Navigation Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-[calc(100vh-450px)] sticky top-24">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                                <h3 className="text-sm font-bold text-gray-900 uppercase">Danh sách câu hỏi</h3>
                                <button
                                    onClick={handleAddQuestion}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md flex items-center gap-1 transition"
                                >
                                    <Plus size={14} /> Thêm
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-5 gap-2">
                                    {quiz.questions.map((q, idx) => {
                                        const isFilled = q.content.trim() && q.options.every(o => o.content.trim());
                                        const isActive = idx === selectedIdx;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedIdx(idx)}
                                                className={`
                                                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium border transition-all
                                                    ${isActive
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100'
                                                    : isFilled
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                }
                                                `}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-xs text-gray-500 mb-3">
                                    <span>Hoàn thành: <strong className="text-green-600">{completedCount}</strong></span>
                                    <span>Tổng số: <strong>{quiz.questions.length}</strong></span>
                                </div>
                                <button
                                    onClick={handleDeleteQuestion}
                                    className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
                                >
                                    <Trash2 size={16} /> Xóa câu hiện tại
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Editor (8 cols) --- */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 min-h-[600px]">

                            {/* Editor Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                    {selectedIdx + 1}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Nội dung câu hỏi</h2>
                                    <p className="text-xs text-gray-500">Điền nội dung câu hỏi và chọn đáp án đúng</p>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="mb-6">
                                <textarea
                                    value={currentQuestion.content}
                                    onChange={e => handleQuestionContentChange('content', e.target.value)}
                                    placeholder="Nhập nội dung câu hỏi..."
                                    rows={3}
                                    className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Options List */}
                            <div className="space-y-3 mb-8">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Các lựa chọn</label>
                                {currentQuestion.options.map((opt, oIdx) => (
                                    <div
                                        key={oIdx}
                                        onClick={() => handleSetCorrectOption(oIdx)}
                                        className={`
                                            group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none
                                            ${opt.isCorrect
                                            ? 'border-green-500 bg-green-50/50 shadow-sm'
                                            : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                                        }
                                        `}
                                    >
                                        {/* Radio Circle */}
                                        <div className={`
                                            w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors shrink-0
                                            ${opt.isCorrect
                                            ? 'border-green-600 bg-green-600 text-white'
                                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                                        }
                                        `}>
                                            {opt.isCorrect ? <CheckCircle2 size={14} strokeWidth={3} /> : <Circle size={10} className="text-transparent" />}
                                        </div>

                                        {/* Input */}
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={opt.content}
                                                onChange={(e) => {
                                                    e.stopPropagation(); // Ngăn kích hoạt click chọn đáp án đúng khi đang gõ
                                                    handleOptionChange(oIdx, e.target.value);
                                                }}
                                                placeholder={`Nhập đáp án ${String.fromCharCode(65 + oIdx)}...`}
                                                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
                                            />
                                        </div>

                                        {/* Label (A, B, C, D) */}
                                        <div className={`
                                            text-sm font-bold w-6 text-right transition-colors
                                            ${opt.isCorrect ? 'text-green-600' : 'text-gray-300 group-hover:text-gray-400'}
                                        `}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Explanation (Optional) */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={16} className="text-orange-500" />
                                    <label className="text-xs font-bold text-gray-700 uppercase">Giải thích (Tùy chọn)</label>
                                </div>
                                <textarea
                                    value={currentQuestion.explanation}
                                    onChange={e => handleQuestionContentChange('explanation', e.target.value)}
                                    placeholder="Giải thích này sẽ hiện ra sau khi người dùng trả lời xong..."
                                    rows={2}
                                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none text-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminQuizEdit;
