// src/pages/supporter/FlashcardWordManager.js
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Volume2, Image,Copy, CheckCircle2, XCircle, Headphones, FileImage } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import AddWordModal from '../../components/user/AddWordModal';
import BulkImportWordsModal from '../../components/Supporter/BulkImportWordsModal';
const FlashcardWordManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [flashcard, setFlashcard] = useState(null);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newWord, setNewWord] = useState({
        newWord: '', meaning: '', wordForm: '', phoneme: '', imageURL: '', audioURL: ''
    });

    const [addStatus, setAddStatus] = useState(null);

    useEffect(() => {
        fetchFlashcardAndWords();
    }, [id]);

    const fetchFlashcardAndWords = async () => {
        try {
            const res1 = await fetch(`http://localhost:3001/api/flashcards/${id}`);
            const info = await res1.json();
            if (info.success) setFlashcard(info.data);

            const res2 = await fetch(`http://localhost:3001/api/flashcards/${id}/words`);
            const wordsData = await res2.json();
            if (wordsData.success) setWords(wordsData.data || []);
        } catch (err) {
            alert('Lỗi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setNewWord(prev => ({ ...prev, [field]: value }));
        setAddStatus(null);
    };

    const addWord = async () => {
        if (!newWord.newWord.trim() || !newWord.meaning.trim()) {
            setAddStatus('error');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/flashcards/${id}/words`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWord)
            });

            if (res.ok) {
                const result = await res.json();
                setWords(prev => [...prev, { ...newWord, id: result.data?.id || Date.now() }]);
                setNewWord({ newWord: '', meaning: '', wordForm: '', phoneme: '', imageURL: '', audioURL: '' });
                setAddStatus('success');
                setTimeout(() => setAddStatus(null), 3000);
            } else {
                setAddStatus('error');
            }
        } catch (err) {
            setAddStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const deleteWord = (index) => {
        if (!window.confirm('Xóa từ này?')) return;
        setWords(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <SupporterSidebar />
                <div className="flex-1 ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/supporter/flashcards')} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý từ vựng</h1>
                                <p className="text-sm text-gray-600">Bộ thẻ: <strong>{flashcard?.title}</strong> • {words.length} từ</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/supporter/flashcards')} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Hoàn tất
                        </button>
                    </div>
                </header>

                <main className="p-6">
                    <div className="flex gap-3 mb-5">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5"/>
                            Thêm từ mới
                        </button>
                        <button
                            onClick={() => setShowBulkImport(true)}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Copy className="w-5 h-5"/>
                            Nhập hàng loạt
                        </button>

                    </div>
                    <AddWordModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        wordForm={newWord}
                        onInputChange={handleInputChange}
                        onSubmit={addWord}
                        isLoading={saving}
                    />

                    <BulkImportWordsModal
                        isOpen={showBulkImport}
                        onClose={() => setShowBulkImport(false)}
                        flashcardId={id}
                        onSuccess={() => fetchFlashcardAndWords()} // Reload danh sách
                    />
                    {/* Bảng danh sách từ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Danh sách từ vựng ({words.length})</h2>
                        </div>

                        {words.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">Chưa có từ nào. Hãy thêm từ đầu tiên!</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs font-medium text-gray-600 uppercase">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Từ vựng</th>
                                        <th className="px-5 py-3 text-left">Nghĩa</th>
                                        <th className="px-5 py-3 text-center">Loại từ</th>
                                        <th className="px-5 py-3 text-center">Phiên âm</th>
                                        <th className="px-5 py-3 text-center">Ảnh</th>
                                        <th className="px-5 py-3 text-center">Âm thanh</th>
                                        <th className="px-5 py-3 text-center">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-sm">
                                    {words.map((word, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-5 py-4 font-medium text-gray-900">{word.newWord}</td>
                                            <td className="px-5 py-4 text-gray-700">{word.meaning}</td>
                                            <td className="px-5 py-4 text-center">
                                                {word.wordForm ? (
                                                    <span
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {word.wordForm}
                            </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-600 font-mono text-xs">
                                                {word.phoneme || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {word.imageURL ?
                                                    <FileImage className="w-5 h-5 text-green-600 mx-auto"/> : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {word.audioURL ?
                                                    <Headphones className="w-5 h-5 text-purple-600 mx-auto"/> : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button onClick={() => deleteWord(i)}
                                                        className="p-2 hover:bg-red-50 rounded text-red-600">
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlashcardWordManager;
