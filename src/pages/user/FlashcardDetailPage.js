
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';
import {
    Plus, Edit, Trash2, ArrowLeft, BookOpen,
    Volume2, Layers, X, Copy, Globe, Lock, ShieldCheck
} from 'lucide-react';

import BulkImportWordsModal from '../../components/Supporter/BulkImportWordsModal';

function FlashcardDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);

    // State bổ sung xử lý loading riêng cho nút đổi trạng thái hiển thị
    const [visibilityLoading, setVisibilityLoading] = useState(false);

    const [currentWord, setCurrentWord] = useState(null);
    const [wordForm, setWordForm] = useState({
        newWord: '', meaning: '', example: '', wordForm: 'NOUN',
        phoneme: '', imageURL: '', audioURL: ''
    });

    const fetchFlashcardDetails = useCallback(async () => {
        try {
            setLoading(prev => prev); // giữ nguyên, không dùng flashcard trong deps
            setLoading(true);         // luôn show loading, đơn giản hơn
            const response = await flashcardAPI.getFlashcardDetails(id);
            if (response.data.status === 200) {
                setFlashcard(response.data.data);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching flashcard:', error);
            setError('Không thể tải thông tin flashcard. Vui lòng kiểm tra ID.');
        } finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        fetchFlashcardDetails();
    }, [id, fetchFlashcardDetails]);


    // Kiểm tra quyền chỉnh sửa
    const canEdit = flashcard?.isOwner === true;

    // ====== LOGIC ĐỔI TRẠNG THÁI HIỂN THỊ (VISIBILITY) ======
    const handleToggleVisibility = async () => {
        if (!canEdit || visibilityLoading) return;

        // Kiểm tra chặn nếu bộ thẻ bị dính cờ vi phạm (Khớp với logic nghiệp vụ Backend)
        if (flashcard.isViolated) {
            notify.error("Bộ thẻ này đã bị đánh dấu vi phạm, không thể chuyển sang Công khai!");
            return;
        }

        const nextVisibility = flashcard.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
        const confirmMessage = nextVisibility === 'PUBLIC'
            ? "Bạn muốn CÔNG KHAI bộ thẻ này cho mọi thành viên cùng học?"
            : "Bạn muốn chuyển bộ thẻ này về chế độ RIÊNG TƯ?";

        if (!window.confirm(confirmMessage)) return;

        try {
            setVisibilityLoading(true);

            // Gọi API truyền query param theo định dạng: /{id}/visibility?visibility=PUBLIC|PRIVATE
            const response = await flashcardAPI.changeVisibility(id, nextVisibility);

            if (response.status === 200 || response.data?.success) {
                notify.success(nextVisibility === 'PUBLIC' ? "Đã công khai bộ từ vựng!" : "Đã chuyển về riêng tư!");
                // Cập nhật nhanh State mà không cần tải lại toàn bộ trang
                setFlashcard(prev => ({ ...prev, visibility: nextVisibility }));
            }
        } catch (error) {
            console.error(error);
            notify.error(error.response?.data?.message || "Không thể thay đổi quyền riêng tư.");
        } finally {
            setVisibilityLoading(false);
        }
    };

    const handleBulkImportSuccess = () => {
        notify.success('Nhập dữ liệu hàng loạt thành công!');
        setShowBulkImport(false);
        fetchFlashcardDetails();
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

    const handleAddWord = async (e) => {
        e.preventDefault();
        try {
            const response = await flashcardAPI.addWordToFlashcard(id, wordForm);
            if (response.data.status === 200 || response.status === 201) {
                notify.success('Thêm từ thành công!');
                setShowAddModal(false);
                resetForm();
                fetchFlashcardDetails();
            }
        } catch (error) {
            notify.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEditClick = (word) => {
        setCurrentWord(word);
        setWordForm({ ...word });
        setShowEditModal(true);
    };

    const handleUpdateWord = async (e) => {
        e.preventDefault();
        try {
            const response = await flashcardAPI.updateWord(id, currentWord.id, wordForm);
            if (response.data.status === 200) {
                notify.success('Cập nhật thành công!');
                setShowEditModal(false);
                resetForm();
                fetchFlashcardDetails();
            }
        } catch (error) {
            notify.error('Lỗi khi cập nhật');
        }
    };

    const handleDeleteWord = async (wordId) => {
        if (!window.confirm("Xóa từ này?")) return;
        try {
            await flashcardAPI.deleteWord(id, wordId);
            notify.success("Xóa từ thành công");
            fetchFlashcardDetails();
        } catch (err) {
            notify.error("Lỗi khi xóa từ");
        }
    };

    const handleStartLearning = async () => {
        if (!flashcard?.words?.length) {
            notify.warning("Bộ thẻ trống!");
            return;
        }
        navigate(`/flashcard/${id}/learn`);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-zinc-900"></div></div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => navigate('/flashcard')} className="bg-zinc-900 text-white px-4 py-2 rounded">Quay lại</button>
        </div>
    );

    return (
        <>
            <Header />
            <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-6">
                <div className="max-w-5xl mx-auto">

                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-zinc-500 hover:text-black transition-colors">
                        <ArrowLeft size={18} /> Quay lại
                    </button>

                    {/* Flashcard Header Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 mb-8 relative overflow-hidden">
                        {/* Background Decoration */}


                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    flashcard.type === 'SYSTEM' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                                }`}>
                                    {flashcard.type === 'SYSTEM' ? 'Hệ thống' : 'Thành viên'}
                                </span>

                                {/* ĐÃ SỬA: Biến badge visibility tĩnh thành nút bấm chuyển đổi động cho chủ sở hữu */}
                                {canEdit ? (
                                    <button
                                        onClick={handleToggleVisibility}
                                        disabled={visibilityLoading}
                                        title="Click để thay đổi quyền riêng tư"
                                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 ${
                                            flashcard.visibility === 'PUBLIC'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        }`}
                                    >
                                        {flashcard.visibility === 'PUBLIC' ? <Globe size={12} /> : <Lock size={12} />}
                                        {flashcard.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'} (Thay đổi)
                                    </button>
                                ) : (
                                    // Giữ nguyên hiển thị dạng Badge tĩnh cho người dùng thông thường vãng lai
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                                        {flashcard.visibility === 'PUBLIC' ? <Globe size={12} /> : <Lock size={12} />}
                                        {flashcard.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                                    </span>
                                )}

                                {/* ĐỂ BẢO VỆ UX: Hiển thị cảnh báo trực quan nếu bộ thẻ bị Admin khóa vi phạm */}
                                {flashcard.isViolated && (
                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-200 animate-pulse">
                                        <ShieldCheck size={12} /> Đã khóa vi phạm
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex-1">
                                    <h1 className="text-4xl font-black text-zinc-900 mb-3">{flashcard.title}</h1>
                                    <p className="text-zinc-500 text-lg font-light max-w-2xl italic">
                                        {flashcard.description || "Chưa có mô tả cho bộ thẻ này."}
                                    </p>

                                    <div className="flex gap-6 mt-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Chủ đề</p>
                                            <p className="font-semibold text-zinc-700">{flashcard.topic}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Trình độ</p>
                                            <p className="font-semibold text-zinc-700">Level {flashcard.level}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Số lượng</p>
                                            <p className="font-semibold text-zinc-700">{flashcard.wordCount} từ</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                    <button onClick={handleStartLearning} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                                        <BookOpen size={18} /> Học ngay
                                    </button>

                                    {/* Chỉ hiện nút quản lý nếu là chủ sở hữu */}
                                    {canEdit && (
                                        <>
                                            <button onClick={() => setShowAddModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition">
                                                <Plus size={18} /> Thêm từ
                                            </button>
                                            <button onClick={() => setShowBulkImport(true)} className="p-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition" title="Nhập hàng loạt">
                                                <Copy size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Words */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                                <Layers size={20} className="text-zinc-400" />
                                Danh sách từ vựng
                            </h2>
                        </div>

                        {flashcard.words?.length > 0 ? (
                            flashcard.words.map((word) => (
                                <div key={word.id} className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col md:flex-row gap-6 hover:border-zinc-400 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-zinc-900">{word.newWord}</h3>
                                            <span className="text-xs font-medium text-zinc-400">({word.wordForm})</span>
                                            {word.phoneme && <span className="text-zinc-400 font-mono">/{word.phoneme}/</span>}
                                            {word.audioURL && (
                                                <button onClick={() => new Audio(word.audioURL).play()} className="text-zinc-400 hover:text-emerald-500">
                                                    <Volume2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-zinc-700 mb-3"><span className="font-semibold">Nghĩa:</span> {word.meaning}</p>
                                        {word.example && (
                                            <p className="text-sm text-zinc-500 italic bg-zinc-50 p-2 rounded border-l-2 border-zinc-200">"{word.example}"</p>
                                        )}

                                        {/* Nút sửa/xóa từng từ nếu có quyền */}
                                        {canEdit && (
                                            <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-50">
                                                <button onClick={() => handleEditClick(word)} className="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1">
                                                    <Edit size={14} /> Sửa
                                                </button>
                                                <button onClick={() => handleDeleteWord(word.id)} className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                                                    <Trash2 size={14} /> Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {word.imageURL && (
                                        <img src={word.imageURL} alt="" className="w-24 h-24 object-cover rounded-lg border border-zinc-100" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-zinc-200">
                                <p className="text-zinc-400">Chưa có từ vựng nào trong bộ thẻ này.</p>
                                {canEdit && (
                                    <button onClick={() => setShowAddModal(true)} className="mt-4 text-emerald-600 font-bold hover:underline">
                                        + Thêm từ ngay
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {canEdit && (
                <>
                    <WordModal
                        showModal={showAddModal}
                        title="Thêm từ mới"
                        wordForm={wordForm}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleAddWord}
                        closeModal={() => { setShowAddModal(false); resetForm(); }}
                        actionText="Thêm từ"
                    />
                    <WordModal
                        showModal={showEditModal}
                        title="Cập nhật từ vựng"
                        wordForm={wordForm}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleUpdateWord}
                        closeModal={() => { setShowEditModal(false); resetForm(); }}
                        actionText="Lưu thay đổi"
                    />
                    <BulkImportWordsModal
                        isOpen={showBulkImport}
                        onClose={() => setShowBulkImport(false)}
                        flashcardId={id}
                        onSuccess={handleBulkImportSuccess}
                    />
                </>
            )}
            <Footer />
        </>
    );
}

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
        <div className="space-y-4">
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
