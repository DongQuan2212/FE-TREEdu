import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Headphones,
    FileImage,
    Save,
    Copy,
    X,
    Edit2,
    BookOpen
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import Sidebar from '../../components/Admin/Sidebar';
import AddWordModal from '../../components/user/AddWordModal';

import BulkImportWordsModal from '../../components/Supporter/BulkImportWordsModal';

import { flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

const FlashcardWordManagerAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State Data
    const [flashcard, setFlashcard] = useState(null);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [saving, setSaving] = useState(false);

    // Inline Edit State (Giữ nguyên tính năng của Admin)
    const [editingWordId, setEditingWordId] = useState(null);
    const [editingWord, setEditingWord] = useState({});

    // New Word State
    const [newWord, setNewWord] = useState({
        newWord: '',
        meaning: '',
        wordForm: '',
        phoneme: '',
        imageURL: '',
        audioURL: ''
    });

    // --- FETCH DATA (Đồng bộ logic với Supporter) ---
    const fetchFlashcard = async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setLoading(true);
        try {
            const res = await flashcardAPI.getFlashcardDetails(id);
            if (res.data.success) {
                setFlashcard(res.data.data);
                setWords(res.data.data.words || []);
            }
        } catch (error) {
            console.error(error);
            notify.error('Không thể tải dữ liệu bộ từ vựng!');
        } finally {
            if (!isBackgroundRefresh) setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchFlashcard();
        }
    }, [id]);

    // --- HANDLER: BULK IMPORT SUCCESS ---
    const handleBulkImportSuccess = () => {
        // Refresh dữ liệu ngầm (không hiện loading quay vòng toàn trang)
        fetchFlashcard(true);
        notify.success('Nhập liệu hàng loạt thành công!');
        setShowBulkImport(false);
    };

    // --- HANDLER: ADD SINGLE WORD ---
    const handleAddWord = async () => {
        if (!newWord.newWord.trim() || !newWord.meaning.trim()) {
            notify.warn('Vui lòng nhập từ và nghĩa!');
            return;
        }
        setSaving(true);
        try {
            const res = await flashcardAPI.addWordToFlashcard(id, newWord);
            if (res.data.success) {
                setWords(prev => [...prev, res.data.data]);
                setNewWord({ newWord: '', meaning: '', wordForm: '', phoneme: '', imageURL: '', audioURL: '' });
                setShowAddModal(false);
                notify.success('Thêm từ mới thành công!');
            }
        } catch (error) {
            console.error(error);
            notify.error('Thêm từ thất bại, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // --- HANDLERS: INLINE EDIT ---
    const startEdit = (word) => {
        setEditingWordId(word.id);
        setEditingWord({ ...word });
    };

    const cancelEdit = () => {
        setEditingWordId(null);
        setEditingWord({});
    };

    const saveEdit = async () => {
        try {
            const res = await flashcardAPI.updateWord(id, editingWordId, editingWord);
            if (res.data.success) {
                setWords(prev => prev.map(w => w.id === editingWordId ? res.data.data : w));
                cancelEdit();
                notify.success('Cập nhật từ vựng thành công!');
            }
        } catch (error) {
            console.error(error);
            notify.error('Cập nhật thất bại!');
        }
    };

    // --- HANDLERS: DELETE ---
    const deleteWord = async (wordId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi bộ thẻ?')) return;

        try {
            await flashcardAPI.deleteWord(id, wordId);
            setWords(prev => prev.filter(w => w.id !== wordId));
            notify.success('Đã xóa từ vựng.');
        } catch (error) {
            console.error(error);
            notify.error('Xóa thất bại!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-64">
                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/flashcard')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                                title="Quay lại danh sách"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-gray-700" />
                                    Chi tiết Flashcard
                                </h1>
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                    Bộ thẻ: <span className="font-semibold text-gray-900">{flashcard?.title || 'Đang tải...'}</span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{words.length} từ vựng</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/admin/flashcard')}
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Hoàn tất
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm từ mới
                        </button>

                        <button
                            onClick={() => setShowBulkImport(true)}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                        >
                            <Copy className="w-4 h-4" />
                            Nhập hàng loạt (Excel)
                        </button>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-gray-900"></div>
                            </div>
                        ) : words.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Chưa có từ vựng nào</h3>
                                <p className="text-gray-500 mt-1">Hãy bắt đầu thêm từ vựng cho bộ flashcard này.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[20%]">Từ vựng</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[25%]">Định nghĩa</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[15%]">Loại từ</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase w-[15%]">Phiên âm</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase w-[10%]">Media</th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-600 uppercase w-[15%]">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {words.map(w => {
                                        const isEditing = editingWordId === w.id;
                                        return (
                                            <tr key={w.id} className="hover:bg-gray-50 group">
                                                {/* 1. Word */}
                                                <td className="px-5 py-4 align-top">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                                            value={editingWord.newWord}
                                                            onChange={e => setEditingWord({ ...editingWord, newWord: e.target.value })}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-gray-900">{w.newWord}</span>
                                                    )}
                                                </td>
                                                {/* 2. Meaning */}
                                                <td className="px-5 py-4 align-top">
                                                    {isEditing ? (
                                                        <textarea
                                                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                                                            rows={2}
                                                            value={editingWord.meaning}
                                                            onChange={e => setEditingWord({ ...editingWord, meaning: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{w.meaning}</span>
                                                    )}
                                                </td>
                                                {/* 3. Type */}
                                                <td className="px-5 py-4 align-top">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                                            value={editingWord.wordForm || ''}
                                                            onChange={e => setEditingWord({ ...editingWord, wordForm: e.target.value })}
                                                            placeholder="(n), (v)..."
                                                        />
                                                    ) : (
                                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs italic border border-gray-200">
                                                                {w.wordForm || '—'}
                                                            </span>
                                                    )}
                                                </td>
                                                {/* 4. Phoneme */}
                                                <td className="px-5 py-4 align-top">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none font-mono"
                                                            value={editingWord.phoneme || ''}
                                                            onChange={e => setEditingWord({ ...editingWord, phoneme: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-gray-500 text-sm">
                                                                {w.phoneme ? `/${w.phoneme}/` : '—'}
                                                            </span>
                                                    )}
                                                </td>
                                                {/* 5. Media Indicators */}
                                                <td className="px-5 py-4 align-top text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <FileImage
                                                            size={18}
                                                            className={w.imageURL ? "text-blue-600" : "text-gray-200"}
                                                        />
                                                        <Headphones
                                                            size={18}
                                                            className={w.audioURL ? "text-purple-600" : "text-gray-200"}
                                                        />
                                                    </div>
                                                </td>
                                                {/* 6. Actions */}
                                                <td className="px-5 py-4 align-top text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    onClick={saveEdit}
                                                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                                                    title="Lưu"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                                                                    title="Hủy"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => startEdit(w)}
                                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                                                                    title="Sửa nhanh"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteWord(w.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            <AddWordModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                wordForm={newWord}
                onInputChange={(field, value) => setNewWord(prev => ({ ...prev, [field]: value }))}
                onSubmit={handleAddWord}
                isLoading={saving}
            />

            {/* FIXED: Bulk Import giống Supporter */}
            <BulkImportWordsModal
                isOpen={showBulkImport}
                onClose={() => setShowBulkImport(false)}
                flashcardId={id} // Đảm bảo ID được truyền vào đúng
                onSuccess={handleBulkImportSuccess}
            />
        </div>
    );
};

export default FlashcardWordManagerAdmin;
