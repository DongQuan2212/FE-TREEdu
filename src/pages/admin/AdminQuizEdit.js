// src/pages/admin/AdminQuizEdit.js
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "../../config/axiosConfig";

// 1. Import Notify
import { notify } from '../../utils/toastNotify';

const AdminQuizEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState({
        title: '',
        topic: '',
        level: 1,
        timer: 60,
        questions: []
    });

    const [selectedIdx, setSelectedIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/quiz/edit/${id}`);

                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    const formattedQuestions = data.questions.map(q => ({
                        questionId: q.questionId,
                        content: q.content || '',
                        explanation: q.explanation || '',
                        options: q.options.map(opt => ({
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
                        questions: formattedQuestions
                    });

                    if (formattedQuestions.length === 0) addQuestion();
                } else {
                    notify.error('Không tìm thấy bài quiz!');
                    navigate('/admin/quiz');
                }
            } catch (err) {
                console.error(err);
                notify.error('Lỗi tải dữ liệu quiz!');
                navigate('/admin/quiz');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchQuiz();
    }, [id, navigate]);

    const updateQuizInfo = (field, value) => {
        setQuiz(prev => ({ ...prev, [field]: value }));
    };

    const updateCurrent = (field, value) => {
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
        }));
        setSelectedIdx(quiz.questions.length);
    };

    const deleteQuestion = (idx) => {
        if (quiz.questions.length <= 1) {
            notify.warning('Phải giữ ít nhất 1 câu hỏi!');
            return;
        }
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx)
        }));
        if (selectedIdx >= quiz.questions.length - 1) {
            setSelectedIdx(Math.max(0, quiz.questions.length - 2));
        }
    };

    const saveQuiz = async () => {
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

        setSaving(true);
        try {
            await axiosInstance.put(`/quiz/${id}`, quiz);
            notify.success('Cập nhật bài quiz thành công!');
            navigate('/admin/quiz');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Lỗi khi lưu quiz!';
            notify.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const currentQ = quiz.questions[selectedIdx] || { content: '', options: [], explanation: '' };
    const filledCount = quiz.questions.filter(q =>
        q.content.trim() && q.options.every(o => o.content.trim())
    ).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />
                <div className="flex-1 ml-0 lg:ml-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">

                {/* 2. HEADER ĐỒNG BỘ */}
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
                                <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài Quiz</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    ID: <span className="font-mono text-gray-800">{id}</span>
                                </p>
                            </div>
                        </div>

                        {/* Button Save đồng bộ màu xanh lá */}
                        <button
                            onClick={saveQuiz}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm disabled:opacity-70"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto w-full">
                    {/* Thông tin Quiz */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-gray-700" />
                            Thông tin chung
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={quiz.title}
                                    onChange={e => updateQuizInfo('title', e.target.value)}
                                    placeholder="Nhập tiêu đề quiz..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Chủ đề <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={quiz.topic}
                                    onChange={e => updateQuizInfo('topic', e.target.value)}
                                    placeholder="Ví dụ: TOEIC, Grammar..."
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

                    {/* Main Editor */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Cột trái: Question Editor */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">
                                            {selectedIdx + 1}
                                        </span>
                                        Nội dung câu hỏi
                                    </h2>
                                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        Tiến độ: <span className="text-gray-900">{filledCount}/{quiz.questions.length}</span>
                                    </span>
                                </div>

                                {/* Textarea Question */}
                                <textarea
                                    placeholder="Nhập nội dung câu hỏi tại đây..."
                                    value={currentQ.content}
                                    onChange={e => updateCurrent('content', e.target.value)}
                                    rows="3"
                                    className="w-full text-base mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                />

                                {/* Options */}
                                <div className="space-y-3 flex-1">
                                    {currentQ.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            onClick={() => selectCorrect(i)}
                                            className={`group relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer
                                                ${opt.isCorrect
                                                ? 'border-lime-500 bg-lime-50 ring-1 ring-lime-500'
                                                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                        >
                                            {/* Radio Icon mimic */}
                                            <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                                                ${opt.isCorrect ? 'border-lime-600 bg-lime-600 text-white' : 'border-gray-400 bg-white'}`}>
                                                {opt.isCorrect && <CheckCircle2 size={12} />}
                                            </div>

                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + i)}`}
                                                    value={opt.content}
                                                    onChange={e => updateOption(i, e.target.value)}
                                                    className={`w-full bg-transparent outline-none text-sm font-medium ${opt.isCorrect ? 'text-gray-900' : 'text-gray-700'}`}
                                                />
                                            </div>

                                            <div className="absolute top-2 right-2 text-xs font-bold text-gray-300 group-hover:text-gray-400 select-none">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Giải thích (Optional)</label>
                                    <textarea
                                        placeholder="Giải thích chi tiết (hiển thị sau khi người dùng trả lời)..."
                                        value={currentQ.explanation || ''}
                                        onChange={e => updateCurrent('explanation', e.target.value)}
                                        rows="2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none resize-none text-sm text-gray-600 bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Danh sách câu hỏi */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase">Danh sách câu hỏi</h3>
                                    <button
                                        onClick={addQuestion}
                                        className="text-xs flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded hover:bg-black transition"
                                    >
                                        <Plus size={12} /> Thêm
                                    </button>
                                </div>

                                <div className="grid grid-cols-5 gap-2 mb-6 max-h-[400px] overflow-y-auto pr-1">
                                    {quiz.questions.map((q, i) => {
                                        const isFilled = q.content.trim() && q.options.every(o => o.content.trim());
                                        const isActive = i === selectedIdx;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedIdx(i)}
                                                className={`aspect-square rounded-lg font-medium text-sm transition-all flex items-center justify-center border
                                                    ${isActive
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
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
                                    {quiz.questions.length > 1 ? (
                                        <button
                                            onClick={() => deleteQuestion(selectedIdx)}
                                            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Xóa câu hiện tại
                                        </button>
                                    ) : (
                                        <p className="text-xs text-center text-gray-400 italic">
                                            Cần ít nhất 1 câu hỏi
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminQuizEdit;
