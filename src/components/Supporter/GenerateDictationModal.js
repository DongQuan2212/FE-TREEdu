import React, { useState } from 'react';
import { X } from 'lucide-react';
import { dictationAPI } from '../../config/api';

const GenerateDictationModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('A1');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        // 🌟 Không cho đóng modal khi đang xử lý AI
        if (loading) return;
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title.trim()) {
            alert("Vui lòng nhập đầy đủ tiêu đề và chọn file audio/video!");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('level', level);

            const response = await dictationAPI.generateByAI(formData);

            if (response.data && response.data.success) {
                alert('AI đã bóc băng và tạo bài nghe thành công!');
                // 🌟 Reset form trước khi đóng
                setFile(null);
                setTitle('');
                setLevel('A1');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Lỗi khi AI tạo bài:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Có lỗi xảy ra: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Tạo bài nghe bằng AI</h2>
                    {/* 🌟 Disable nút X khi đang loading */}
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài nghe</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                                placeholder="VD: Luyện nghe IELTS - Task 1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó (Level)</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                            >
                                <option value="A1">A1 - Cơ bản</option>
                                <option value="A2">A2 - Sơ trung cấp</option>
                                <option value="B1">B1 - Trung cấp</option>
                                <option value="B2">B2 - Thượng trung cấp</option>
                                <option value="C1">C1 - Nâng cao</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Audio/Video (Mp3, Mp4)</label>
                            <input
                                type="file"
                                accept="audio/*,video/mp4"
                                onChange={(e) => setFile(e.target.files[0])}
                                disabled={loading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                            {/* 🌟 Hiện tên file đã chọn */}
                            {file && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </p>
                            )}
                        </div>

                        {/* 🌟 Progress bar giả khi đang xử lý AI (process lâu nên cần feedback UI) */}
                        {loading && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                                    <span className="font-medium">AI đang xử lý... có thể mất vài phút</span>
                                </div>
                                <p className="text-blue-500">Whisper đang phân tích âm thanh, vui lòng không đóng trang.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-5 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Đang xử lý bằng AI...
                                </>
                            ) : "Tạo bài học"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerateDictationModal;
