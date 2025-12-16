import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "../../config/axiosConfig";

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
                    alert('Không tìm thấy bài quiz!');
                    navigate('/admin/quiz');
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi tải dữ liệu quiz!');
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
            alert('Phải giữ ít nhất 1 câu hỏi!');
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
            alert('Vui lòng nhập đầy đủ tiêu đề và chủ đề!');
            return;
        }

        for (let q of quiz.questions) {
            if (!q.content.trim()) return alert('Tất cả câu hỏi phải có nội dung!');
            if (q.options.some(o => !o.content.trim())) return alert('Tất cả đáp án phải có nội dung!');
            if (!q.options.some(o => o.isCorrect)) return alert('Mỗi câu phải có đúng 1 đáp án đúng!');
        }

        setSaving(true);
        try {
            await axiosInstance.put(`/quiz/${id}`, quiz);
            alert('Cập nhật bài quiz thành công!');
            navigate('/admin/quiz');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Lỗi khi lưu quiz!');
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
                    <div className="text-2xl font-bold text-gray-700">Đang tải bài quiz...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 hover:bg-gray-100 rounded-xl transition"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài Quiz</h1>
                                <p className="text-gray-600">ID: {id}</p>
                            </div>
                        </div>
                        <button
                            onClick={saveQuiz}
                            disabled={saving}
                            className="bg-lime-600 hover:bg-lime-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition shadow-lg disabled:opacity-70"
                        >
                            {saving ? 'Đang lưu...' : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Thông tin Quiz */}
                <div className="p-6 max-w-7xl mx-auto mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-lime-600" />
                            Thông tin bài Quiz
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={quiz.title}
                                    onChange={e => updateQuizInfo('title', e.target.value)}
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề *</label>
                                <input
                                    type="text"
                                    value={quiz.topic}
                                    onChange={e => updateQuizInfo('topic', e.target.value)}
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ</label>
                                <select
                                    value={quiz.level}
                                    onChange={e => updateQuizInfo('level', Number(e.target.value))}
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none transition"
                                >
                                    {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Cấp độ {l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Thời gian (phút)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="180"
                                    value={quiz.timer}
                                    onChange={e => updateQuizInfo('timer', Number(e.target.value))}
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 px-6 pb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Editor chính */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-96 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-lime-700">
                                            Câu hỏi {selectedIdx + 1}
                                        </h2>
                                        <span className="text-lg text-gray-600">
                                            Đã hoàn thiện: {filledCount}/{quiz.questions.length}
                                        </span>
                                    </div>

                                    <textarea
                                        placeholder="Nội dung câu hỏi..."
                                        value={currentQ.content}
                                        onChange={e => updateCurrent('content', e.target.value)}
                                        rows="4"
                                        className="text-lg mb-8 px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none resize-none"
                                    />

                                    <div className="space-y-4 flex-1">
                                        {currentQ.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => selectCorrect(i)}
                                                className={`w-full text-left p-5 rounded-lg border-2 transition-all shadow-sm
                                                    ${opt.isCorrect
                                                    ? 'border-lime-600 bg-lime-50 font-bold'
                                                    : opt.content.trim()
                                                        ? 'border-gray-300 hover:border-lime-500 hover:bg-lime-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                <textarea
                                                    placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                                                    value={opt.content}
                                                    onChange={e => updateOption(i, e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    rows="2"
                                                    className="w-full bg-transparent outline-none text-lg resize-none"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        placeholder="Giải thích chi tiết (hiển thị sau khi trả lời)..."
                                        value={currentQ.explanation || ''}
                                        onChange={e => updateCurrent('explanation', e.target.value)}
                                        rows="5"
                                        className="mt-8 px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none resize-none text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Danh sách câu hỏi */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                                        Danh sách câu hỏi
                                    </h3>
                                    <div className="grid grid-cols-5 gap-3 mb-8">
                                        {quiz.questions.map((q, i) => {
                                            const isFilled = q.content.trim() && q.options.every(o => o.content.trim());
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedIdx(i)}
                                                    className={`w-12 h-12 rounded-lg font-bold text-lg transition-all shadow-md
                                                        ${i === selectedIdx
                                                        ? 'bg-lime-600 text-white scale-110'
                                                        : isFilled
                                                            ? 'bg-lime-100 text-lime-800 hover:bg-lime-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={addQuestion}
                                            className="w-full py-4 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-3"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Thêm câu hỏi
                                        </button>

                                        {quiz.questions.length > 1 && (
                                            <button
                                                onClick={() => deleteQuestion(selectedIdx)}
                                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-3"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                Xóa câu hiện tại
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminQuizEdit;
