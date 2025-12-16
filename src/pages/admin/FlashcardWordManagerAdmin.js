import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, Plus, Trash2, CheckCircle2,
    Headphones, FileImage, Edit2, X, Save, Copy
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Import đúng Sidebar của Admin
import AdminSidebar from '../../components/Admin/Sidebar';

// Reuse các Modal từ user/supporter component
import AddWordModal from '../../components/user/AddWordModal';
import BulkImportWordsModal from '../../components/Supporter/BulkImportWordsModal';

import { flashcardAPI } from '../../config/api';

const FlashcardWordManagerAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [editingWordId, setEditingWordId] = useState(null);
    const [editingWord, setEditingWord] = useState({});

    // New Word State (cho AddModal)
    const [newWord, setNewWord] = useState({
        newWord: '',
        meaning: '',
        wordForm: '',
        phoneme: '',
        imageURL: '',
        audioURL: ''
    });

    // =============================
    // FETCH DATA
    // =============================
    const fetchFlashcard = async () => {
        setLoading(true);
        try {
            const res = await flashcardAPI.getFlashcardDetails(id);
            if (res.data.success) {
                setFlashcard(res.data.data);
                setWords(res.data.data.words || []);
            }
        } catch (error) {
            console.error(error);
            alert('Không tải được dữ liệu flashcard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcard();
    }, [id]);

    // =============================
    // ADD WORD (Modal)
    // =============================
    const handleAddWord = async () => {
        if (!newWord.newWord.trim() || !newWord.meaning.trim()) return;
        setSaving(true);
        try {
            const res = await flashcardAPI.addWordToFlashcard(id, newWord);
            if (res.data.success) {
                setWords(prev => [...prev, res.data.data]);
                setNewWord({ newWord: '', meaning: '', wordForm: '', phoneme: '', imageURL: '', audioURL: '' });
                setShowAddModal(false);
            }
        } catch (error) {
            alert('Thêm từ thất bại');
        } finally {
            setSaving(false);
        }
    };

    // =============================
    // INLINE EDIT
    // =============================
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
            }
        } catch {
            alert('Cập nhật thất bại');
        }
    };

    // =============================
    // DELETE
    // =============================
    const deleteWord = async (wordId) => {
        if (!window.confirm('Bạn có chắc muốn xóa từ này không?')) return;
        try {
            await flashcardAPI.deleteWord(id, wordId);
            setWords(prev => prev.filter(w => w.id !== wordId));
        } catch {
            alert('Xóa thất bại');
        }
    };

    // =============================
    // UI RENDER
    // =============================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <AdminSidebar />
                <div className="flex-1 ml-72 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />

            <div className="flex-1 ml-72">
                {/* HEADER */}
                <header className="bg-white border-b sticky top-0 z-40">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/admin/flashcard')}>
                                <ArrowLeft className="text-gray-600 hover:text-black transition-colors" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">Quản lý từ vựng</h1>
                                <p className="text-sm text-gray-600">
                                    Bộ thẻ: <span className="font-semibold text-black">{flashcard?.title}</span> • {words.length} từ
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/admin/flashcard')}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                        >
                            <CheckCircle2 size={18} />
                            Hoàn tất
                        </button>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="p-6">
                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Plus size={20} /> Thêm từ mới
                        </button>

                        <button
                            onClick={() => setShowBulkImport(true)}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Copy size={18} /> Nhập hàng loạt
                        </button>
                    </div>

                    {/* Modals - RENDERED HERE */}
                    <AddWordModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        wordForm={newWord}
                        onInputChange={(field, value) => setNewWord(prev => ({ ...prev, [field]: value }))}
                        onSubmit={handleAddWord}
                        isLoading={saving}
                    />

                    <BulkImportWordsModal
                        isOpen={showBulkImport}
                        onClose={() => setShowBulkImport(false)}
                        flashcardId={id}
                        onSuccess={fetchFlashcard}
                    />

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Danh sách từ vựng</span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{words.length} items</span>
                        </div>

                        {words.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="mb-2">📭</div>
                                Chưa có từ vựng nào trong bộ thẻ này.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="p-4 text-left w-[20%]">Từ vựng</th>
                                    <th className="p-4 text-left w-[25%]">Nghĩa</th>
                                    <th className="p-4 text-left w-[15%]">Loại từ</th>
                                    <th className="p-4 text-left w-[15%]">Phiên âm</th>
                                    <th className="p-4 text-center w-[10%]">Media</th>
                                    <th className="p-4 text-right w-[15%]">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {words.map(w => {
                                    const isEditing = editingWordId === w.id;
                                    return (
                                        <tr key={w.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Column: Từ vựng */}
                                            <td className="p-4 align-top">
                                                {isEditing ? (
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                                        value={editingWord.newWord}
                                                        onChange={e => setEditingWord({ ...editingWord, newWord: e.target.value })}
                                                        placeholder="Từ vựng"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-gray-900 text-base">{w.newWord}</span>
                                                )}
                                            </td>

                                            {/* Column: Nghĩa */}
                                            <td className="p-4 align-top">
                                                {isEditing ? (
                                                    <textarea
                                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                                                        rows={2}
                                                        value={editingWord.meaning}
                                                        onChange={e => setEditingWord({ ...editingWord, meaning: e.target.value })}
                                                        placeholder="Nghĩa"
                                                    />
                                                ) : (
                                                    <span className="text-gray-700">{w.meaning}</span>
                                                )}
                                            </td>

                                            {/* Column: Loại từ */}
                                            <td className="p-4 align-top">
                                                {isEditing ? (
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                                                        value={editingWord.wordForm || ''}
                                                        onChange={e => setEditingWord({ ...editingWord, wordForm: e.target.value })}
                                                        placeholder="(n), (v)..."
                                                    />
                                                ) : (
                                                    <span className="italic text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {w.wordForm || '—'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column: Phiên âm */}
                                            <td className="p-4 align-top">
                                                {isEditing ? (
                                                    <input
                                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black outline-none font-mono"
                                                        value={editingWord.phoneme || ''}
                                                        onChange={e => setEditingWord({ ...editingWord, phoneme: e.target.value })}
                                                    />
                                                ) : (
                                                    <span className="font-mono text-gray-600 text-xs">
                                                        {w.phoneme ? `/${w.phoneme}/` : '—'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column: Media Indicators */}
                                            <td className="p-4 align-top text-center">
                                                <div className="flex justify-center gap-2 text-gray-400">
                                                    <FileImage size={18} className={w.imageURL ? "text-blue-500" : ""} />
                                                    <Headphones size={18} className={w.audioURL ? "text-purple-500" : ""} />
                                                </div>
                                            </td>

                                            {/* Column: Actions */}
                                            <td className="p-4 align-top text-right">
                                                <div className="flex justify-end gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={saveEdit}
                                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                                title="Lưu"
                                                            >
                                                                <Save size={18} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                                title="Hủy"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEdit(w)}
                                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                                title="Sửa"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteWord(w.id)}
                                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={18} />
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
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlashcardWordManagerAdmin;
