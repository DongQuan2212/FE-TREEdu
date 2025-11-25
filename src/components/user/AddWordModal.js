// src/components/Supporter/AddWordModal.js
import React from 'react';
import { X, Plus } from 'lucide-react';

const AddWordModal = ({ isOpen, onClose, wordForm, onInputChange, onSubmit, isLoading }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Plus className="w-7 h-7 text-blue-600" />
                        Thêm từ mới
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Từ vựng */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Từ vựng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={wordForm.newWord}
                                onChange={(e) => onInputChange('newWord', e.target.value)}
                                required
                                placeholder="hello, beautiful, 食べる..."
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Nghĩa */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nghĩa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={wordForm.meaning}
                                onChange={(e) => onInputChange('meaning', e.target.value)}
                                required
                                placeholder="xin chào, xinh đẹp, ăn..."
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Loại từ */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Loại từ</label>
                            <select
                                value={wordForm.wordForm}
                                onChange={(e) => onInputChange('wordForm', e.target.value)}
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">— Chọn loại từ —</option>
                                <option value="Danh từ">Danh từ</option>
                                <option value="Động từ">Động từ</option>
                                <option value="Tính từ">Tính từ</option>
                                <option value="Trạng từ">Trạng từ</option>
                                <option value="Đại từ">Đại từ</option>
                                <option value="Giới từ">Giới từ</option>
                                <option value="Liên từ">Liên từ</option>
                                <option value="Thán từ">Thán từ</option>
                                <option value="Cụm từ">Cụm từ</option>
                            </select>
                        </div>

                        {/* Phiên âm */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phiên âm</label>
                            <input
                                type="text"
                                value={wordForm.phoneme}
                                onChange={(e) => onInputChange('phoneme', e.target.value)}
                                placeholder="/həˈloʊ/, /たべる/"
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                        </div>

                        {/* URL ảnh */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Link ảnh (tùy chọn)</label>
                            <input
                                type="url"
                                value={wordForm.imageURL}
                                onChange={(e) => onInputChange('imageURL', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* URL âm thanh */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Link âm thanh (tùy chọn)</label>
                            <input
                                type="url"
                                value={wordForm.audioURL}
                                onChange={(e) => onInputChange('audioURL', e.target.value)}
                                placeholder="https://example.com/audio.mp3"
                                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
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
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-70 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {isLoading ? 'Đang thêm...' : 'Thêm từ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddWordModal;
