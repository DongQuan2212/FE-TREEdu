import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';

function FlashcardDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentWord, setCurrentWord] = useState(null);

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
            }
        } catch (error) {
            console.error('Error fetching flashcard:', error);
            alert('Không thể tải thông tin flashcard');
            navigate('/flashcard/me');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setWordForm({
            newWord: '', meaning: '', example: '', wordForm: 'NOUN',
            phoneme: '', imageURL: '', audioURL: ''
        });
    };

    const handleAddWord = async (e) => {
        e.preventDefault();
        if (!wordForm.newWord.trim() || !wordForm.meaning.trim()) {
            alert('Vui lòng nhập từ vựng và nghĩa');
            return;
        }
        try {
            const response = await flashcardAPI.addWordToFlashcard(id, wordForm);
            if (response.data.status === 200) {
                alert('Thêm từ thành công!');
                setShowAddModal(false);
                resetForm();
                fetchFlashcardDetails();
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi thêm từ');
        }
    };

    const handleEditClick = (word) => {
        setCurrentWord(word);
        setWordForm({
            newWord: word.newWord,
            meaning: word.meaning,
            example: word.example || '',
            wordForm: word.wordForm || 'NOUN',
            phoneme: word.phoneme || '',
            imageURL: word.imageURL || '',
            audioURL: word.audioURL || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateWord = async (e) => {
        e.preventDefault();
        if (!wordForm.newWord.trim() || !wordForm.meaning.trim()) {
            alert('Vui lòng nhập từ vựng và nghĩa');
            return;
        }
        try {
            const response = await flashcardAPI.updateWord(id, currentWord.id, wordForm);
            if (response.data.status === 200) {
                alert('Cập nhật thành công!');
                setShowEditModal(false);
                resetForm();
                setCurrentWord(null);
                fetchFlashcardDetails();
            }
        } catch (error) {
            alert('Có lỗi khi cập nhật');
        }
    };

    const handleDeleteWord = async (wordId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa từ này?')) return;
        try {
            const response = await flashcardAPI.deleteWord(id, wordId);
            if (response.data.status === 200) {
                alert('Xóa thành công!');
                fetchFlashcardDetails();
            }
        } catch (error) {
            alert('Có lỗi khi xóa');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWordForm(prev => ({ ...prev, [name]: value }));
    };

    const getWordTypeLabel = (type) => {
        const labels = {
            NOUN: 'Danh từ', VERB: 'Động từ', ADJECTIVE: 'Tính từ', ADVERB: 'Trạng từ',
            PRONOUN: 'Đại từ', PREPOSITION: 'Giới từ', CONJUNCTION: 'Liên từ', INTERJECTION: 'Thán từ'
        };
        return labels[type] || type;
    };

    // LOADING STATE
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto"></div>
                        <p className="mt-6 text-gray-600 text-lg">Đang tải flashcard...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // KHI KHÔNG CÓ DỮ LIỆU
    if (!flashcard) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-gray-700">Không tìm thấy flashcard</p>
                        <button onClick={() => navigate('/flashcard/me')} className="mt-4 text-blue-600 hover:underline">
                            Quay lại danh sách
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
            <main className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/flashcard/me')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition mt-4  mb-5"
                    >
                        Quay lại
                    </button>

                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">

                            <div className="flex items-start gap-3">

                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{flashcard.title}</h1>
                                    {flashcard.description &&
                                        <p className="text-gray-600 mb-4">{flashcard.description}</p>}
                                    <div className="flex flex-wrap gap-3">
                                        <span
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            Level {flashcard.level || 'N/A'}
                                        </span>
                                        <span
                                            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                            {flashcard.topic || 'Không có chủ đề'}
                                        </span>
                                        <span
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {flashcard.wordCount || 0} từ
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(true)}
                                    className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition shadow">
                                + Thêm từ mới
                            </button>
                        </div>
                    </div>

                    {/* Danh sách từ vựng - GỌN GÀNG & ĐẸP */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Danh sách từ vựng ({flashcard.wordCount || 0})
                        </h2>

                        {flashcard.words && flashcard.words.length > 0 ? (
                            flashcard.words.map((word) => (
                                <div key={word.id}
                                     className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                                        {/* Nội dung từ - 9 cột */}
                                        <div className="md:col-span-9 space-y-5">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-2xl font-bold text-gray-900">{word.newWord}</h3>
                                                <span
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                    {getWordTypeLabel(word.wordForm).toLowerCase()}
                                                </span>
                                                {word.phoneme && (
                                                    <span className="text-lg text-gray-600 italic font-medium">
                                                        /{word.phoneme}/
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">
                                                    Định nghĩa:
                                                </p>
                                                <p className="text-base text-gray-800 leading-relaxed">{word.meaning}</p>
                                            </div>

                                            {word.example ? (
                                                <div>
                                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">
                                                        Ví dụ:
                                                    </p>
                                                    <div
                                                        className="bg-gray-50 rounded-lg px-4 py-3 border-l-4 border-gray-300">
                                                        <p className="text-base italic text-gray-700 leading-relaxed">
                                                            “{word.example}”
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">Chưa có câu ví dụ</p>
                                            )}

                                            <div
                                                className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity pt-3 border-t border-gray-100">
                                                <button onClick={() => handleEditClick(word)}
                                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">
                                                    Sửa
                                                </button>
                                                <button onClick={() => handleDeleteWord(word.id)}
                                                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition">
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hình ảnh - 3 cột */}
                                        <div className="md:col-span-3 flex justify-center">
                                            {word.imageURL ? (
                                                <img src={word.imageURL} alt={word.newWord}
                                                     className="w-32 h-32 object-cover rounded-lg shadow border border-gray-200"
                                                     onError={(e) => e.target.style.display = 'none'}/>
                                            ) : (
                                                <div
                                                    className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-3xl">Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                                <p className="text-xl text-gray-600">Chưa có từ vựng nào</p>
                                <p className="text-gray-500 mt-2">Nhấn “Thêm từ mới” để bắt đầu!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* === MODAL THÊM TỪ === */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-10 m-auto"
                     onClick={() => setShowAddModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto mt-10" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Thêm từ mới</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-3xl text-gray-500 hover:text-gray-700">&times;</button>
                            </div>
                        </div>
                        <form onSubmit={handleAddWord} className="p-6 space-y-5">
                            {/* Các input giống hệt như cũ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Từ vựng *</label>
                                <input type="text" name="newWord" value={wordForm.newWord} onChange={handleInputChange} required
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black" placeholder="hello"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nghĩa *</label>
                                <input type="text" name="meaning" value={wordForm.meaning} onChange={handleInputChange} required
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black" placeholder="xin chào"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Câu ví dụ (tùy chọn)</label>
                                <textarea name="example" value={wordForm.example} onChange={handleInputChange} rows={2}
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black resize-none"
                                          placeholder="Ví dụ: Hello! How are you today?"/>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại từ</label>
                                    <select name="wordForm" value={wordForm.wordForm} onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black">
                                        <option value="NOUN">Danh từ</option>
                                        <option value="VERB">Động từ</option>
                                        <option value="ADJECTIVE">Tính từ</option>
                                        <option value="ADVERB">Trạng từ</option>
                                        <option value="INTERJECTION">Thán từ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phiên âm</label>
                                    <input type="text" name="phoneme" value={wordForm.phoneme} onChange={handleInputChange}
                                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black" placeholder="/həˈloʊ/"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh (tùy chọn)</label>
                                <input type="url" name="imageURL" value={wordForm.imageURL} onChange={handleInputChange}
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL âm thanh (tùy chọn)</label>
                                <input type="url" name="audioURL" value={wordForm.audioURL} onChange={handleInputChange}
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)}
                                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                                    Hủy
                                </button>
                                <button type="submit"
                                        className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition">
                                    Thêm từ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === MODAL SỬA TỪ === */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa từ</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-3xl text-gray-500 hover:text-gray-700">&times;</button>
                            </div>
                        </div>
                        <form onSubmit={handleUpdateWord} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Từ vựng *</label>
                                <input type="text" name="newWord" value={wordForm.newWord} onChange={handleInputChange} required
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nghĩa *</label>
                                <input type="text" name="meaning" value={wordForm.meaning} onChange={handleInputChange} required
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Câu ví dụ (tùy chọn)</label>
                                <textarea name="example" value={wordForm.example} onChange={handleInputChange} rows={2}
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black resize-none"
                                          placeholder="Ví dụ: Hello! How are you today?"/>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại từ</label>
                                    <select name="wordForm" value={wordForm.wordForm} onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black">
                                        <option value="NOUN">Danh từ</option>
                                        <option value="VERB">Động từ</option>
                                        <option value="ADJECTIVE">Tính từ</option>
                                        <option value="ADVERB">Trạng từ</option>
                                        <option value="INTERJECTION">Thán từ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phiên âm</label>
                                    <input type="text" name="phoneme" value={wordForm.phoneme} onChange={handleInputChange}
                                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                                <input type="url" name="imageURL" value={wordForm.imageURL} onChange={handleInputChange}
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL âm thanh</label>
                                <input type="url" name="audioURL" value={wordForm.audioURL} onChange={handleInputChange}
                                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"/>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)}
                                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                                    Hủy
                                </button>
                                <button type="submit"
                                        className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition">
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

export default FlashcardDetailPage;
