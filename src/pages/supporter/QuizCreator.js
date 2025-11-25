// src/pages/supporter/QuizCreator.js
import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, AlertCircle } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';

const QuizCreator = () => {
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState({
        title: '',
        topic: '',
        level: 1,
        timer: 60,
        questions: []
    });

    const [isSaving, setIsSaving] = useState(false);

    // Thêm câu hỏi mới
    const addQuestion = () => {
        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, {
                content: '',
                explanation: '',
                options: [
                    { content: '', isCorrect: true },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false },
                    { content: '', isCorrect: false }
                ]
            }]
        }));
    };

    // Cập nhật thông tin quiz
    const updateQuizInfo = (field, value) => {
        setQuiz(prev => ({ ...prev, [field]: value }));
    };

    // Cập nhật câu hỏi
    const updateQuestion = (qIndex, field, value) => {
        setQuiz(prev => {
            const updated = [...prev.questions];
            updated[qIndex][field] = value;
            return { ...prev, questions: updated };
        });
    };

    // Cập nhật nội dung đáp án
    const updateOption = (qIndex, oIndex, content) => {
        setQuiz(prev => {
            const updated = [...prev.questions];
            updated[qIndex].options[oIndex].content = content;
            return { ...prev, questions: updated };
        });
    };

    // Chọn đáp án đúng (chỉ 1 đúng)
    const selectCorrectAnswer = (qIndex, oIndex) => {
        setQuiz(prev => {
            const updated = [...prev.questions];
            updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
                ...opt,
                isCorrect: i === oIndex
            }));
            return { ...prev, questions: updated };
        });
    };

    // Xóa câu hỏi
    const deleteQuestion = (index) => {
        if (quiz.questions.length === 1) {
            alert('Phải có ít nhất 1 câu hỏi!');
            return;
        }
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    // Lưu quiz
    const saveQuiz = async () => {
        // Validate
        if (!quiz.title.trim()) return alert('Vui lòng nhập tiêu đề quiz!');
        if (!quiz.topic.trim()) return alert('Vui lòng nhập chủ đề!');
        if (quiz.questions.length === 0) return alert('Vui lòng thêm ít nhất 1 câu hỏi!');

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            if (!q.content.trim()) return alert(`Câu hỏi ${i + 1}: Chưa nhập nội dung câu hỏi!`);
            if (q.options.some(opt => !opt.content.trim())) return alert(`Câu hỏi ${i + 1}: Có đáp án trống!`);
        }

        setIsSaving(true);

        try {
            const res = await fetch('http://localhost:3001/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quiz)
            });

            if (res.ok) {
                alert('Tạo Quiz thành công! 🎉');
                navigate('/supporter/quizzes');
            } else {
                const error = await res.text();
                alert('Lỗi: ' + error);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 hover:bg-gray-100 rounded-xl transition"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Tạo Quiz Mới</h1>
                                <p className="text-gray-600">Thiết kế bài kiểm tra trắc nghiệm chất lượng</p>
                            </div>
                        </div>

                        <button
                            onClick={saveQuiz}
                            disabled={isSaving}
                            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition shadow-lg disabled:opacity-70"
                        >
                            {isSaving ? (
                                <>Đang lưu...</>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Lưu Quiz
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <main className="p-8 max-w-6xl mx-auto">
                    {/* Thông tin chung */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-gray-700" />
                            Thông tin Quiz
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={quiz.title}
                                    onChange={e => updateQuizInfo('title', e.target.value)}
                                    placeholder="VD: Ôn tập Tiếng Việt cơ bản"
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề *</label>
                                <input
                                    type="text"
                                    value={quiz.topic}
                                    onChange={e => updateQuizInfo('topic', e.target.value)}
                                    placeholder="VD: Tiếng Việt"
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ</label>
                                <select
                                    value={quiz.level}
                                    onChange={e => updateQuizInfo('level', Number(e.target.value))}
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={6}>6</option>
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
                                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Danh sách câu hỏi */}
                    <div className="space-y-8">
                        {quiz.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <GripVertical className="w-6 h-6 text-gray-400 cursor-move" />
                                        <h3 className="text-xl font-bold text-gray-900">Câu hỏi {qIndex + 1}</h3>
                                    </div>
                                    <button
                                        onClick={() => deleteQuestion(qIndex)}
                                        className="p-3 hover:bg-red-50 rounded-xl text-red-600 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Nhập nội dung câu hỏi..."
                                    value={q.content}
                                    onChange={e => updateQuestion(qIndex, 'content', e.target.value)}
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-lg font-medium focus:ring-2 focus:ring-gray-900 outline-none mb-6"
                                />

                                <div className="space-y-4 mb-6">
                                    {q.options.map((opt, oIndex) => (
                                        <label
                                            key={oIndex}
                                            className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                                                opt.isCorrect
                                                    ? 'border-green-500 bg-green-50 shadow-sm'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`correct-${qIndex}`}
                                                checked={opt.isCorrect}
                                                onChange={() => selectCorrectAnswer(qIndex, oIndex)}
                                                className="w-5 h-5 text-gray-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                                                value={opt.content}
                                                onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-transparent outline-none font-medium text-gray-800"
                                            />
                                        </label>
                                    ))}
                                </div>

                                <textarea
                                    placeholder="Giải thích (hiển thị sau khi trả lời)..."
                                    value={q.explanation}
                                    onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                                    rows="3"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none resize-none text-gray-700"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Nút thêm câu hỏi */}
                    <div className="text-center mt-12">
                        <button
                            onClick={addQuestion}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-lg transition shadow-lg"
                        >
                            <Plus className="w-7 h-7" />
                            Thêm câu hỏi mới
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QuizCreator;
