import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/user//Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';
import {
    BookOpen,
    ArrowLeft,
    Loader2,
    Info,
    ChevronDown,
    Globe,
    Lock
} from 'lucide-react';

function CreateFlashcardPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 1,
        topic: '',
        visibility: 'PUBLIC' // Thêm trường mới ở đây
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
        if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
        else if (formData.title.length < 3) newErrors.title = 'Tiêu đề quá ngắn (tối thiểu 3 ký tự)';

        if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
        if (!formData.topic.trim()) newErrors.topic = 'Vui lòng nhập chủ đề';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            // formData lúc này đã bao gồm field visibility
            const response = await flashcardAPI.createFlashcard(formData);

            if (response.data.status === 200 || response.data.status === 201) {
                notify.success('Tạo bộ flashcard mới thành công!');
                navigate(`/flashcard/detail/${response.data.data.id}`);
            }
        } catch (error) {
            console.error('Error:', error);
            notify.error(error.response?.data?.message || 'Không thể tạo flashcard. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/flashcard');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 mt-10">
            <Header />

            <main className="flex-1 pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">

                    <button
                        onClick={handleBack}
                        className="group flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Quay lại
                    </button>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3">
                            Tạo bộ thẻ mới
                        </h1>
                        <p className="text-gray-500 text-lg font-light">
                            Thiết lập thông tin cơ bản cho bộ từ vựng của bạn.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Title Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Tên bộ thẻ
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ví dụ: 3000 từ vựng Oxford..."
                                className={`w-full bg-transparent px-4 py-3.5 border rounded-lg outline-none transition-all placeholder:text-gray-300
                                    ${errors.title
                                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                                }`}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả ngắn gọn về nội dung..."
                                className={`w-full bg-transparent px-4 py-3.5 border rounded-lg outline-none transition-all resize-none placeholder:text-gray-300
                                    ${errors.description
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-200 focus:border-black'
                                }`}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        {/* Group: Topic & Level & Visibility */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Topic */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Chủ đề
                                </label>
                                <div className="relative">
                                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="topic"
                                        value={formData.topic}
                                        onChange={handleChange}
                                        placeholder="IELTS, Daily..."
                                        className={`w-full bg-transparent pl-10 pr-4 py-3.5 border rounded-lg outline-none transition-all placeholder:text-gray-300
                                            ${errors.topic
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:border-black'
                                        }`}
                                    />
                                </div>
                                {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                            </div>

                            {/* Level */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Độ khó
                                </label>
                                <div className="relative">
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="w-full bg-transparent pl-4 pr-10 py-3.5 border border-gray-200 rounded-lg outline-none focus:border-black appearance-none cursor-pointer"
                                    >
                                        {[1, 2, 3, 4, 5].map(l => (
                                            <option key={l} value={l}>Level {l}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Visibility Field - Trường mới thêm */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Chế độ hiển thị
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, visibility: 'PUBLIC' }))}
                                        className={`flex items-center justify-center gap-3 px-4 py-3.5 border rounded-lg transition-all ${
                                            formData.visibility === 'PUBLIC'
                                                ? 'border-black bg-gray-50 ring-1 ring-black'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <Globe className={`w-4 h-4 ${formData.visibility === 'PUBLIC' ? 'text-blue-500' : ''}`} />
                                        <span className="text-sm font-medium">Công khai</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, visibility: 'PRIVATE' }))}
                                        className={`flex items-center justify-center gap-3 px-4 py-3.5 border rounded-lg transition-all ${
                                            formData.visibility === 'PRIVATE'
                                                ? 'border-black bg-gray-50 ring-1 ring-black'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                    >
                                        <Lock className={`w-4 h-4 ${formData.visibility === 'PRIVATE' ? 'text-amber-500' : ''}`} />
                                        <span className="text-sm font-medium">Riêng tư</span>
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    {formData.visibility === 'PUBLIC'
                                        ? "Mọi người đều có thể tìm thấy và học bộ thẻ này."
                                        : "Chỉ bạn mới có thể xem và quản lý bộ thẻ này."}
                                </p>
                            </div>
                        </div>

                        {/* Minimal Info Box */}
                        <div className="flex gap-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>• Hãy chọn tiêu đề ngắn gọn.</p>
                                <p>• Phân loại Level chính xác giúp hệ thống gợi ý tốt hơn.</p>
                                <p>• Chế độ Riêng tư giúp bảo mật nội dung cá nhân của bạn.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100 mt-8">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                disabled={loading}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Đang xử lý...</span>
                                    </div>
                                ) : (
                                    "Tạo bộ thẻ"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default CreateFlashcardPage;
