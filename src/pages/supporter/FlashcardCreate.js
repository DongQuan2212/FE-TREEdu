
import React, { useState } from 'react';
import { ArrowLeft, Save, BookOpen, AlertCircle } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';

const FlashcardCreate = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        level: 1
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Xóa lỗi khi người dùng nhập
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
        if (!formData.topic.trim()) newErrors.topic = 'Vui lòng nhập chủ đề';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const res = await fetch('http://localhost:3001/api/flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                alert('Tạo bộ flashcard thành công!');
                // Chuyển hướng đến trang thêm từ ngay lập tức
                navigate(`/supporter/flashcards/edit/${result.data.id}`);
            } else {
                alert(result.message || 'Tạo thất bại!');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server!');
        } finally {
            setSaving(false);
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
                                onClick={() => navigate('/supporter/flashcards')}
                                className="p-3 hover:bg-gray-100 rounded-xl transition"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Tạo bộ Flashcard mới</h1>
                                <p className="text-gray-600">Bước 1: Tạo bộ thẻ → Bước 2: Thêm từ vựng</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition shadow-lg disabled:opacity-70"
                        >
                            {saving ? (
                                'Đang tạo...'
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Tạo bộ thẻ
                                </>
                            )}
                        </button>
                    </div>
                </header>
                <main className="p-8 max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <BookOpen className="w-7 h-7 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Thông tin bộ Flashcard</h2>
                                <p className="text-gray-600">Sau khi tạo, bạn sẽ được chuyển đến trang thêm từ vựng</p>
                            </div>
                        </div>
                        <div className="space-y-7">
                            {/* Tiêu đề */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tiêu đề bộ thẻ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                    placeholder="Ví dụ: 1000 Từ vựng TOEIC cơ bản"
                                    className={`w-full px-5 py-4 border rounded-xl text-lg focus:ring-2 focus:ring-gray-900 outline-none transition ${
                                        errors.title ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.title && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả (khuyến khích)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Ví dụ: Bộ 1000 từ vựng TOEIC thường gặp, phù hợp cho người mới bắt đầu..."
                                    rows="4"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                />
                            </div>
                            {/* Chủ đề */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Chủ đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={e => handleChange('topic', e.target.value)}
                                    placeholder="Ví dụ: TOEIC, IELTS, Tiếng Anh giao tiếp, Hán tự N5..."
                                    className={`w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition ${
                                        errors.topic ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.topic && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.topic}
                                    </p>
                                )}
                            </div>
                            {/* Cấp độ */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cấp độ
                                </label>
                                <select
                                    value={formData.level}
                                    onChange={e => handleChange('level', Number(e.target.value))}
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                >
                                    <option value={1}>Level 1 - Cơ bản nhất</option>
                                    <option value={2}>Level 2 - Sơ cấp</option>
                                    <option value={3}>Level 3 - Trung cấp</option>
                                    <option value={4}>Level 4 - Trung cao cấp</option>
                                    <option value={5}>Level 5 - Nâng cao</option>
                                    <option value={6}>Level 6 - Chuyên sâu</option>
                                </select>
                            </div>
                        </div>
                        {/* Hướng dẫn */}
                        <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">Sau khi tạo bộ thẻ:</h4>
                                    <p className="text-blue-800 mt-1">
                                        Bạn sẽ được chuyển ngay đến trang <strong>thêm từ vựng</strong> (word, meaning, pronunciation, image, audio...)<br />
                                        Có thể thêm hàng loạt từ một lúc rất nhanh!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlashcardCreate;
