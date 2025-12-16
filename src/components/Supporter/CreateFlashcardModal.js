// src/components/Supporter/CreateFlashcardModal.js
import React, { useState } from 'react';
import { X, Plus, BookOpen, AlertCircle } from 'lucide-react';
import {flashcardAPI} from "../../config/api";

const CreateFlashcardModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        level: 1
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            const res = await flashcardAPI.createFlashcard(formData);

            const result = res.data;

            if (result.success) {
                onSuccess(result.data.id);
                onClose();

                setFormData({
                    title: '',
                    description: '',
                    topic: '',
                    level: 1,
                });
                setErrors({});
            } else {
                alert(result.message || 'Tạo thất bại!');
            }
        } catch (err) {
            console.error(err);

            if (err.response?.status === 403) {
                alert('Bạn không có quyền tạo flashcard!');
            } else {
                alert('Lỗi kết nối server!');
            }
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10 p-2" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                        Tạo bộ Flashcard mới
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-7">
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
                            className={`w-full px-5 py-4 border rounded-xl text-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả (khuyến khích)</label>
                        <textarea
                            value={formData.description}
                            onChange={e => handleChange('description', e.target.value)}
                            placeholder="Ví dụ: Bộ 1000 từ vựng TOEIC thường gặp..."
                            rows="3"
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
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
                            placeholder="Ví dụ: TOEIC, IELTS, Tiếng Anh giao tiếp..."
                            className={`w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition ${
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ</label>
                        <select
                            value={formData.level}
                            onChange={e => handleChange('level', Number(e.target.value))}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {[1,2,3,4,5,6].map(l => (
                                <option key={l} value={l}>Level {l} - {l === 1 ? 'Cơ bản nhất' : l === 6 ? 'Chuyên sâu' : `Cấp ${l}`}</option>
                            ))}
                        </select>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-70 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {saving ? 'Đang tạo...' : 'Tạo bộ thẻ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFlashcardModal;
