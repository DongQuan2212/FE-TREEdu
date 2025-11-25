import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';
import { BookOpenIcon, LightBulbIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {XIcon} from "lucide-react";

function CreateFlashcardPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 1,
        topic: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'level' ? parseInt(value) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
        else if (formData.title.length < 3) newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';

        if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
        if (!formData.topic.trim()) newErrors.topic = 'Chủ đề không được để trống';
        if (formData.level < 1 || formData.level > 10) newErrors.level = 'Level phải từ 1 đến 10';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await flashcardAPI.createFlashcard(formData);

            if (response.data.status === 200 || response.data.status === 201) {
                alert('Tạo flashcard thành công!');
                navigate(`/flashcard/detail/${response.data.data.id}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi tạo flashcard. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate('/flashcard/me');

    return (
        <>
            <Header />

            <main className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* Header Hero */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl shadow-xl mb-6">
                            <BookOpenIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-800 mb-4">
                            Tạo Flashcard Mới
                        </h1>
                        <p className="text-xl text-gray-600">
                            Xây dựng bộ từ vựng riêng của bạn một cách dễ dàng
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Tiêu đề */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 1000 từ vựng TOEIC cơ bản"
                                    className={`w-full px-5 py-4 text-lg rounded-2xl border-2 transition-all focus:ring-4 focus:ring-green-100 ${
                                        errors.title
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-gray-200 focus:border-green-500'
                                    }`}
                                    disabled={loading}
                                />
                                {errors.title && (
                                    <p className="mt-2 text-red-600 text-sm flex items-center gap-2">
                                        <XMarkIcon className="w-5 h-5" />
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Mô tả <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả ngắn gọn về bộ flashcard này..."
                                    className={`w-full px-5 py-4 text-lg rounded-2xl border-2 transition-all focus:ring-4 focus:ring-green-100 resize-none ${
                                        errors.description
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-gray-200 focus:border-green-500'
                                    }`}
                                    disabled={loading}
                                />
                                {errors.description && (
                                    <p className="mt-2 text-red-600 text-sm flex items-center gap-2">
                                        <XMarkIcon className="w-5 h-5" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Chủ đề & Level */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                                        Chủ đề <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="topic"
                                        value={formData.topic}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: TOEIC, IELTS, Daily Conversation"
                                        className={`w-full px-5 py-4 text-lg rounded-2xl border-2 transition-all focus:ring-4 focus:ring-green-100 ${
                                            errors.topic
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-gray-200 focus:border-green-500'
                                        }`}
                                        disabled={loading}
                                    />
                                    {errors.topic && (
                                        <p className="mt-2 text-red-600 text-sm flex items-center gap-2">
                                            <XIcon className="w-5 h-5" />
                                            {errors.topic}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                                        Cấp độ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-4 text-lg rounded-2xl border-2 transition-all focus:ring-4 focus:ring-green-100 ${
                                            errors.level
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-gray-200 focus:border-green-500'
                                        } bg-white`}
                                        disabled={loading}
                                    >
                                        {[1,2,3,4,5,6].map(l => (
                                            <option key={l} value={l}>Level {l} {l <= 2 ? '(Dễ)' : l <= 4 ? '(Trung bình)' : '(Khó)'}</option>
                                        ))}
                                    </select>
                                    {errors.level && (
                                        <p className="mt-2 text-red-600 text-sm flex items-center gap-2">
                                            <XMarkIcon className="w-5 h-5" />
                                            {errors.level}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Nút hành động */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold text-lg transition transform hover:scale-105 disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-semibold text-lg shadow-lg transition transform hover:scale-105 disabled:opacity-60 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-7 h-7" />
                                            Tạo Flashcard
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tips Card */}
                    <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-md">
                                <LightBulbIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-800 mb-3">Mẹo nhỏ để học hiệu quả hơn</h3>
                                <ul className="space-y-2 text-green-700">
                                    <li className="flex items-center gap-3">
                                        <span className="text-2xl">Check</span>
                                        <span>Chọn tiêu đề ngắn gọn, dễ nhớ</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-2xl">Check</span>
                                        <span>Mô tả chi tiết giúp bạn quản lý tốt hơn sau này</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-2xl">Check</span>
                                        <span>Chọn level phù hợp để hệ thống gợi ý từ vựng phù hợp</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </>
    );
}

export default CreateFlashcardPage;
