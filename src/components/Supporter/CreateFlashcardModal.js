// src/components/Supporter/CreateFlashcardModal.js
import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, AlertCircle, Globe, Lock } from 'lucide-react';
import { flashcardAPI } from "../../config/api";

const CreateFlashcardModal = ({ isOpen, onClose, onSuccess, defaultVisibility }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        level: 1,
        visibility: 'PRIVATE' // Trạng thái mặc định ban đầu nếu không truyền prop
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Cập nhật lại giá trị mặc định ban đầu mỗi khi mở Modal dựa theo cấu hình trang cha
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                visibility: defaultVisibility || 'PRIVATE'
            }));
        }
    }, [isOpen, defaultVisibility]);

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

                // Reset form sạch sẽ sau khi tạo thành công
                setFormData({
                    title: '',
                    description: '',
                    topic: '',
                    level: 1,
                    visibility: defaultVisibility || 'PRIVATE'
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
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

                    {/* Hàng 2 cột: Chủ đề & Cấp độ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chủ đề */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Chủ đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={e => handleChange('topic', e.target.value)}
                                placeholder="Ví dụ: TOEIC, IELTS..."
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
                                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                            >
                                {[1, 2, 3, 4, 5, 6].map(l => (
                                    <option key={l} value={l}>Level {l} - {l === 1 ? 'Cơ bản' : l === 6 ? 'Chuyên sâu' : `Cấp ${l}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ====== TRƯỜNG MỚI BỔ SUNG: TRẠNG THÁI HIỂN THỊ TRỰC QUAN ====== */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Quyền riêng tư / Trạng thái hiển thị
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Option Public */}
                            <div
                                onClick={() => handleChange('visibility', 'PUBLIC')}
                                className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition select-none ${
                                    formData.visibility === 'PUBLIC'
                                        ? 'border-gray-950 bg-gray-50 ring-2 ring-gray-950'
                                        : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <div className={`p-2 rounded-lg mt-0.5 ${formData.visibility === 'PUBLIC' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">Công khai (PUBLIC)</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Tất cả mọi thành viên trong hệ thống đều có thể tìm thấy và học tập.</p>
                                </div>
                            </div>

                            {/* Option Private */}
                            <div
                                onClick={() => handleChange('visibility', 'PRIVATE')}
                                className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition select-none ${
                                    formData.visibility === 'PRIVATE'
                                        ? 'border-gray-950 bg-gray-50 ring-2 ring-gray-950'
                                        : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <div className={`p-2 rounded-lg mt-0.5 ${formData.visibility === 'PRIVATE' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">Riêng tư (PRIVATE)</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Chỉ người tạo hoặc những tài khoản có thẩm quyền quản trị mới thấy bộ thẻ.</p>
                                </div>
                            </div>
                        </div>
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
