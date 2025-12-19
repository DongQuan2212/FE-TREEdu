import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify'; // Import notify
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, Volume2, Link, Layers, X } from 'lucide-react';

function FlashcardDetailPage() {
    const { id } = useParams(); // Đây là flashcardId
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal controls
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // State quản lý từ đang sửa
    const [currentWord, setCurrentWord] = useState(null);

    // Form data
    const [wordForm, setWordForm] = useState({
        newWord: '',
        meaning: '',
        example: '',
        wordForm: 'NOUN',
        phoneme: '',
        imageURL: '',
        audioURL: ''
    });

    useEffect(() => {
        fetchFlashcardDetails();
    }, [id]);

    const fetchFlashcardDetails = async () => {
        try {
            setLoading(true);
            const response = await flashcardAPI.getFlashcardDetails(id);
            if (response.data.status === 200) {
                setFlashcard(response.data.data);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching flashcard:', error);
            setError('Không thể tải thông tin flashcard. Vui lòng kiểm tra ID.');
            setFlashcard(null);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setWordForm({
            newWord: '', meaning: '', example: '', wordForm: 'NOUN',
            phoneme: '', imageURL: '', audioURL: ''
        });
        setCurrentWord(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWordForm(prev => ({ ...prev, [name]: value }));
    };

    // --- 1. HANDLE ADD (THÊM TỪ) ---
    const handleAddWord = async (e) => {
        e.preventDefault();
        if (!wordForm.newWord.trim() || !wordForm.meaning.trim()) {
            notify.warning('Vui lòng nhập từ vựng và nghĩa');
            return;
        }

        const payload = { ...wordForm };

        try {
            const response = await flashcardAPI.addWordToFlashcard(id, payload);
            if (response.data.status === 200 || response.status === 201) {
                notify.success('Thêm từ thành công!');
                setShowAddModal(false);
                resetForm();
                fetchFlashcardDetails();
            }
        } catch (error) {
            console.error("Lỗi thêm từ:", error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi thêm từ';
            notify.error(msg);
        }
    };

    // --- 2. PREPARE EDIT (CHUẨN BỊ SỬA) ---
    const handleEditClick = (word) => {
        setCurrentWord(word);
        setWordForm({
            newWord: word.newWord || '',
            meaning: word.meaning || '',
            example: word.example || '',
            wordForm: word.wordForm || 'NOUN',
            phoneme: word.phoneme || '',
            imageURL: word.imageURL || '',
            audioURL: word.audioURL || ''
        });
        setShowEditModal(true);
    };

    const handleStartLearning = async () => {
        if (flashcard?.words?.length === 0) {
            notify.warning("Bộ flashcard hiện chưa có từ vựng nào. Vui lòng thêm từ trước khi học.");
            return;
        }
        try {
            const res = await flashcardAPI.startLearning(id);
            if (res.data.status === 200) {
                navigate(`/flashcard/${id}/learn`);
            }
        } catch (err) {
            notify.error("Không thể bắt đầu học lúc này");
        }
    };

    const handleUpdateWord = async (e) => {
        e.preventDefault();

        if (!currentWord || !currentWord.id) {
            notify.error("Lỗi: Không xác định được ID từ cần sửa");
            return;
        }

        if (!wordForm.newWord.trim() || !wordForm.meaning.trim()) {
            notify.warning('Vui lòng nhập từ vựng và nghĩa');
            return;
        }

        const payload = { ...wordForm };

        try {
            const response = await flashcardAPI.updateWord(id, currentWord.id, payload);

            if (response.data.status === 200) {
                notify.success('Cập nhật từ vựng thành công!');
                setShowEditModal(false);
                resetForm();
                fetchFlashcardDetails();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            const msg = error.response?.data?.message || 'Có lỗi khi cập nhật';
            notify.error(msg);
        }
    };

    const handleDeleteWord = async (wordId) => {
        // Giữ nguyên window.confirm vì nó là popup hệ thống, không ảnh hưởng UI custom
        if (!window.confirm("Bạn chắc chắn muốn xóa từ này khỏi bộ flashcard?")) return;

        try {
            const response = await flashcardAPI.deleteWord(id, wordId);
            if (response.status === 200 || response.status === 204) {
                notify.success("Xóa từ thành công");
                fetchFlashcardDetails();
            }
        } catch (err) {
            notify.error(err.response?.data?.message || "Lỗi khi xóa từ");
        }
    };

    const getWordTypeLabel = (type) => {
        const labels = {
            NOUN: 'Danh từ', VERB: 'Động từ', ADJECTIVE: 'Tính từ', ADVERB: 'Trạng từ',
            PRONOUN: 'Đại từ', PREPOSITION: 'Giới từ', CONJUNCTION: 'Liên từ', INTERJECTION: 'Thán từ'
        };
        return labels[type] || type;
    };

    // --- RENDER (GIỮ NGUYÊN) ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-zinc-900"></div>
                </main>
                <Footer />
            </>
        );
    }

    if (!flashcard && error) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/flashcard/me')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Quay lại bộ Flashcard
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-6 sm:px-8">
                <div className="max-w-5xl mx-auto">

                    {/* Header Action Bar */}
                    <div className="flex justify-between items-center mb-8 gap-4">
                        <button
                            onClick={() => navigate('/flashcard/me')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-100 transition text-sm font-medium shadow-sm"
                        >
                            <ArrowLeft size={16} />
                            Bộ của tôi
                        </button>
                    </div>

                    {/* Flashcard Info Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-zinc-200 p-8 mb-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-zinc-900 mb-2">{flashcard.title}</h1>
                                {flashcard.description && <p className="text-zinc-600 mb-4">{flashcard.description}</p>}
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <span
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">Level {flashcard.level}</span>
                                    <span
                                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">{flashcard.topic}</span>
                                    <span
                                        className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-semibold border border-zinc-200">{flashcard.wordCount} từ</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 md:pt-2">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition text-sm shadow-md"
                                >
                                    <Plus size={18} /> Thêm từ mới
                                </button>
                                <button
                                    onClick={handleStartLearning}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition text-sm shadow-md"
                                >
                                    <BookOpen size={18} /> Bắt đầu học
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách từ */}
                    <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                        <Layers size={20} className="text-zinc-500" />
                        Danh sách từ vựng ({flashcard.wordCount})
                    </h2>

                    <div className="space-y-6">
                        {flashcard.words && flashcard.words.length > 0 ? (
                            flashcard.words.map((word) => (
                                <div key={word.id}
                                     className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-all duration-300 group">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                                        {/* Left: Content (Col 1-9) */}
                                        <div className="md:col-span-9 space-y-3">
                                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                                                <h3 className="text-2xl font-extrabold text-zinc-900">{word.newWord}</h3>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                                                    {getWordTypeLabel(word.wordForm)}
                                                </span>
                                                {word.phoneme && <span className="text-lg text-zinc-500 italic font-light">[{word.phoneme}]</span>}
                                                {word.audioURL && (
                                                    <button onClick={() => new Audio(word.audioURL).play()}
                                                            className="p-1.5 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition">
                                                        <Volume2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Definition */}
                                            <div>
                                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Định nghĩa:</p>
                                                <p className="text-base text-zinc-800">{word.meaning}</p>
                                            </div>

                                            {/* Example */}
                                            {word.example && (
                                                <div className="bg-zinc-50 rounded-lg px-4 py-3 border-l-4 border-zinc-300">
                                                    <p className="text-base italic text-zinc-700">“{word.example}”</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-3 border-t border-zinc-100">
                                                <button onClick={() => handleEditClick(word)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition shadow-sm">
                                                    <Edit size={16} /> Sửa
                                                </button>
                                                <button onClick={() => handleDeleteWord(word.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition shadow-sm">
                                                    <Trash2 size={16} /> Xóa
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right: Image (Col 10-12) */}
                                        <div className="md:col-span-3 flex justify-center md:justify-end">
                                            {word.imageURL ? (
                                                <img src={word.imageURL} alt={word.newWord}
                                                     className="w-32 h-32 object-cover rounded-lg shadow-md border border-zinc-200"
                                                     onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                            ) : (
                                                <div className="w-32 h-32 bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center">
                                                    <span className="text-zinc-400 text-sm">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-zinc-300">
                                <p className="text-xl text-zinc-600 mb-4">Bộ flashcard này chưa có từ vựng nào.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition shadow-md flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={18} /> Thêm từ đầu tiên
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* === MODAL THÊM TỪ (Tối giản) === */}
            <WordModal
                showModal={showAddModal}
                title="Thêm từ mới vào Flashcard"
                wordForm={wordForm}
                handleInputChange={handleInputChange}
                handleSubmit={handleAddWord}
                closeModal={() => { setShowAddModal(false); resetForm(); }}
                actionText="Thêm từ"
            />

            {/* === MODAL SỬA TỪ (Tối giản) === */}
            <WordModal
                showModal={showEditModal}
                title={`Chỉnh sửa: ${currentWord?.newWord || 'Từ vựng'}`}
                wordForm={wordForm}
                handleInputChange={handleInputChange}
                handleSubmit={handleUpdateWord}
                closeModal={() => { setShowEditModal(false); resetForm(); }}
                actionText="Cập nhật"
            />

            <Footer />
        </>
    );
}

// Component Modal tái sử dụng
const WordModal = ({ showModal, title, wordForm, handleInputChange, handleSubmit, closeModal, actionText }) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
                    <button onClick={closeModal} className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
                    <FormInputs wordForm={wordForm} handleInputChange={handleInputChange} />
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">{actionText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Component con để tái sử dụng Input (đã được làm đẹp)
const FormInputs = ({ wordForm, handleInputChange }) => (
    <>
        <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Từ vựng *</label>
            <input type="text" name="newWord" value={wordForm.newWord} onChange={handleInputChange} required
                   className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors" />
        </div>
        <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nghĩa *</label>
            <input type="text" name="meaning" value={wordForm.meaning} onChange={handleInputChange} required
                   className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors" />
        </div>
        <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Ví dụ</label>
            <textarea name="example" value={wordForm.example} onChange={handleInputChange} rows={2}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Loại từ</label>
                <div className="relative">
                    <select name="wordForm" value={wordForm.wordForm} onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg appearance-none bg-white focus:border-emerald-600 transition-colors cursor-pointer">
                        <option value="NOUN">Danh từ</option>
                        <option value="VERB">Động từ</option>
                        <option value="ADJECTIVE">Tính từ</option>
                        <option value="ADVERB">Trạng từ</option>
                        <option value="INTERJECTION">Thán từ</option>
                        <option value="PREPOSITION">Giới từ</option>
                        <option value="PRONOUN">Đại từ</option>
                        <option value="CONJUNCTION">Liên từ</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Phiên âm</label>
                <input type="text" name="phoneme" value={wordForm.phoneme} onChange={handleInputChange}
                       className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-colors" placeholder="/həˈloʊ/"/>
            </div>
        </div>

        {/* URL Inputs with Icon */}
        <div className="space-y-4">
            <div className="relative">
                <label className="block text-sm font-medium text-zinc-700 mb-1">URL Hình ảnh</label>
                <div className="flex items-center border border-zinc-300 rounded-lg focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-colors">
                    <span className="p-3 text-zinc-400">
                        <Link size={16} />
                    </span>
                    <input type="url" name="imageURL" value={wordForm.imageURL} onChange={handleInputChange}
                           className="w-full py-2.5 pr-4 bg-transparent focus:outline-none" />
                </div>
            </div>
            <div className="relative">
                <label className="block text-sm font-medium text-zinc-700 mb-1">URL Âm thanh</label>
                <div className="flex items-center border border-zinc-300 rounded-lg focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-colors">
                    <span className="p-3 text-zinc-400">
                        <Volume2 size={16} />
                    </span>
                    <input type="url" name="audioURL" value={wordForm.audioURL} onChange={handleInputChange}
                           className="w-full py-2.5 pr-4 bg-transparent focus:outline-none" />
                </div>
            </div>
        </div>
    </>
);

export default FlashcardDetailPage;
