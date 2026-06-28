import React, { useEffect, useState } from 'react';
import {
    ArrowLeft, Plus, Trash2, CheckCircle2,
    Headphones, FileImage, Copy
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import AddWordModal from '../../components/user/AddWordModal';
import BulkImportWordsModal from '../../components/Supporter/BulkImportWordsModal';

import { flashcardAPI } from '../../config/api';

const FlashcardWordManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newWord, setNewWord] = useState({
        newWord: '',
        meaning: '',
        wordForm: '',
        phoneme: '',
        imageURL: '',
        audioURL: ''
    });

    // =============================
    // FETCH FLASHCARD + WORDS
    // =============================
    const fetchFlashcard = async () => {
        setLoading(true);
        try {
            const res = await flashcardAPI.getFlashcardDetails(id);

            if (res.data.success) {
                const data = res.data.data;
                setFlashcard(data);
                setWords(data.words || []);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi tải dữ liệu flashcard!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcard();
    }, [id]);


    const addWord = async () => {
        if (!newWord.newWord.trim() || !newWord.meaning.trim()) return;

        setSaving(true);
        try {
            const res = await flashcardAPI.addWordToFlashcard(id, newWord);

            if (res.data.success) {
                setWords(prev => [...prev, res.data.data]);
                setNewWord({
                    newWord: '',
                    meaning: '',
                    wordForm: '',
                    phoneme: '',
                    imageURL: '',
                    audioURL: ''
                });
                setShowAddModal(false);
            }
        } catch (err) {
            console.error(err);
            alert('Thêm từ thất bại!');
        } finally {
            setSaving(false);
        }
    };

    // =============================
    // DELETE WORD
    // =============================
    const deleteWord = async (wordId) => {
        if (!window.confirm('Xóa từ này?')) return;

        try {
            await flashcardAPI.deleteWord(id, wordId);
            setWords(prev => prev.filter(w => w.id !== wordId));
        } catch (err) {
            console.error(err);
            alert('Xóa từ thất bại!');
        }
    };

    // =============================
    // LOADING UI
    // =============================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <SupporterSidebar />
                <div className="flex-1 ml-72 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
                </div>
            </div>
        );
    }

    // =============================
    // MAIN UI
    // =============================
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                {/* HEADER */}
                <header className="bg-white border-b sticky top-0 z-40">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/supporter/flashcards')}>
                                <ArrowLeft />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">Quản lý từ vựng</h1>
                                <p className="text-sm text-gray-600">
                                    Bộ thẻ: <b>{flashcard?.title}</b> • {words.length} từ
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/supporter/flashcards')}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg flex gap-2"
                        >
                            <CheckCircle2 size={18} />
                            Hoàn tất
                        </button>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="p-6">
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-black text-white px-6 py-3 rounded-xl flex gap-2"
                        >
                            <Plus /> Thêm từ mới
                        </button>

                        <button
                            onClick={() => setShowBulkImport(true)}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl flex gap-2"
                        >
                            <Copy /> Nhập hàng loạt
                        </button>
                    </div>

                    <AddWordModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        wordForm={newWord}
                        onInputChange={(f, v) =>
                            setNewWord(prev => ({ ...prev, [f]: v }))
                        }
                        onSubmit={addWord}
                        isLoading={saving}
                    />

                    <BulkImportWordsModal
                        isOpen={showBulkImport}
                        onClose={() => setShowBulkImport(false)}
                        flashcardId={id}
                        onSuccess={fetchFlashcard}
                    />

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="px-6 py-4 border-b font-bold">
                            Danh sách từ ({words.length})
                        </div>

                        {words.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                Chưa có từ nào
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left">Từ</th>
                                    <th className="p-3 text-left">Nghĩa</th>
                                    <th className="p-3 text-center">Loại</th>
                                    <th className="p-3 text-center">Phiên âm</th>
                                    <th className="p-3 text-center">Ảnh</th>
                                    <th className="p-3 text-center">Audio</th>
                                    <th className="p-3 text-center">Xóa</th>
                                </tr>
                                </thead>
                                <tbody>
                                {words.map(word => (
                                    <tr key={word.id} className="border-t">
                                        <td className="p-3 font-medium">{word.newWord}</td>
                                        <td className="p-3">{word.meaning}</td>
                                        <td className="p-3 text-center">{word.wordForm || '—'}</td>
                                        <td className="p-3 text-center">{word.phoneme || '—'}</td>
                                        <td className="p-3 text-center">
                                            {word.imageURL && <FileImage />}
                                        </td>
                                        <td className="p-3 text-center">
                                            {word.audioURL && <Headphones />}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => deleteWord(word.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlashcardWordManager;
