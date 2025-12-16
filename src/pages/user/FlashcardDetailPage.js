import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { flashcardAPI } from '../../config/api';

function FlashcardDetailPage() {
    const { id } = useParams(); // Đây là flashcardId
    const navigate = useNavigate();

    const [flashcard, setFlashcard] = useState(null);
    const [loading, setLoading] = useState(true);

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
            }
        } catch (error) {
            console.error('Error fetching flashcard:', error);
            // alert('Không thể tải thông tin flashcard');
            // navigate('/flashcard/me');
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
            alert('Vui lòng nhập từ vựng và nghĩa');
            return;
        }

        // Tạo payload giống Postman
        const payload = {
            newWord: wordForm.newWord,
            meaning: wordForm.meaning,
            example: wordForm.example,
            wordForm: wordForm.wordForm,
            phoneme: wordForm.phoneme,
            imageURL: wordForm.imageURL,
            audioURL: wordForm.audioURL
        };

        try {
            const response = await flashcardAPI.addWordToFlashcard(id, payload);
            if (response.data.status === 200 || response.status === 201) {
                alert('Thêm từ thành công!');
                setShowAddModal(false);
                resetForm();
                fetchFlashcardDetails();
            }
        } catch (error) {
            console.error("Lỗi thêm từ:", error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi thêm từ';
            alert(msg);
        }
    };

    // --- 2. PREPARE EDIT (CHUẨN BỊ SỬA) ---
    const handleEditClick = (word) => {
        console.log("Đang chọn từ để sửa:", word);
        setCurrentWord(word); // Lưu lại từ đang chọn để lấy ID sau này

        // Fill dữ liệu vào form (dùng || '' để tránh lỗi null value input)
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

    // --- 3. HANDLE UPDATE (GỌI API SỬA) ---
    const handleUpdateWord = async (e) => {
        e.preventDefault();

        if (!currentWord || !currentWord.id) {
            alert("Lỗi: Không xác định được ID từ cần sửa");
            return;
        }

        if (!wordForm.newWord.trim() || !wordForm.meaning.trim()) {
            alert('Vui lòng nhập từ vựng và nghĩa');
            return;
        }

        const payload = {
            newWord: wordForm.newWord,
            meaning: wordForm.meaning,
            example: wordForm.example,
            wordForm: wordForm.wordForm, // Enum: NOUN, VERB...
            phoneme: wordForm.phoneme,
            imageURL: wordForm.imageURL,
            audioURL: wordForm.audioURL
        };
        console.log("=== SENDING UPDATE ===");
        console.log("FlashcardID:", id);
        console.log("WordID:", currentWord.id);
        console.log("Payload:", payload);
        try {
            // Gọi API: updateWord(flashcardId, wordId, data)
            const response = await flashcardAPI.updateWord(id, currentWord.id, payload);

            console.log("Response Update:", response.data);

            if (response.data.status === 200) {
                alert('Cập nhật thành công!');
                setShowEditModal(false);
                resetForm();
                fetchFlashcardDetails(); // Load lại danh sách mới
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            const msg = error.response?.data?.message || 'Có lỗi khi cập nhật';
            alert(msg);
        }
    };

    const handleDeleteWord = async (wordId) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;

        try {
            const response = await flashcardAPI.deleteWord(id, wordId);
            if (response.status === 200 || response.status === 204) {
                alert("Xóa thành công");
                fetchFlashcardDetails();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi xóa");
        }
    };

    const getWordTypeLabel = (type) => {
        const labels = {
            NOUN: 'Danh từ', VERB: 'Động từ', ADJECTIVE: 'Tính từ', ADVERB: 'Trạng từ',
            PRONOUN: 'Đại từ', PREPOSITION: 'Giới từ', CONJUNCTION: 'Liên từ', INTERJECTION: 'Thán từ'
        };
        return labels[type] || type;
    };

    // --- RENDER ---
    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
                </main>
                <Footer />
            </>
        );
    }

    if (!flashcard) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <p className="text-xl text-gray-700">Không tìm thấy flashcard</p>
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
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition mt-4 mb-5"
                    >
                        Quay lại
                    </button>

                    {/* Header Flashcard Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{flashcard.title}</h1>
                                {flashcard.description && <p className="text-gray-600 mb-4">{flashcard.description}</p>}
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">Level {flashcard.level}</span>
                                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">{flashcard.topic}</span>
                                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{flashcard.wordCount} từ</span>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(true)}
                                    className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition shadow">
                                + Thêm từ mới
                            </button>
                        </div>
                    </div>

                    {/* Danh sách từ */}
                    <div className="space-y-6">
                        {flashcard.words && flashcard.words.length > 0 ? (
                            flashcard.words.map((word) => (
                                <div key={word.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                        <div className="md:col-span-9 space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-2xl font-bold text-gray-900">{word.newWord}</h3>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                    {getWordTypeLabel(word.wordForm)}
                                                </span>
                                                {word.phoneme && <span className="text-lg text-gray-600 italic font-medium">/{word.phoneme}/</span>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Định nghĩa:</p>
                                                <p className="text-base text-gray-800">{word.meaning}</p>
                                            </div>
                                            {word.example && (
                                                <div className="bg-gray-50 rounded-lg px-4 py-3 border-l-4 border-gray-300">
                                                    <p className="text-base italic text-gray-700">“{word.example}”</p>
                                                </div>
                                            )}
                                            {/* Nút Sửa/Xóa */}
                                            <div className="flex gap-3 pt-3 border-t border-gray-100">
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
                                        {/* Hình ảnh */}
                                        <div className="md:col-span-3 flex justify-center">
                                            {word.imageURL ? (
                                                <img src={word.imageURL} alt={word.newWord} className="w-32 h-32 object-cover rounded-lg shadow border"
                                                     onError={(e) => e.target.style.display = 'none'} />
                                            ) : (
                                                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                                <p className="text-xl text-gray-600">Chưa có từ vựng nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* === MODAL THÊM TỪ === */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Thêm từ mới</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-3xl text-gray-500">&times;</button>
                        </div>
                        <form onSubmit={handleAddWord} className="p-6 space-y-4">
                            {/* Input fields giống form sửa */}
                            <FormInputs wordForm={wordForm} handleInputChange={handleInputChange} />
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 rounded-lg">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg">Thêm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === MODAL SỬA TỪ === */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Chỉnh sửa từ</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-3xl text-gray-500">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateWord} className="p-6 space-y-4">
                            <FormInputs wordForm={wordForm} handleInputChange={handleInputChange} />
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 bg-gray-200 rounded-lg">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}

// Component con để tái sử dụng Input (cho gọn code)
const FormInputs = ({ wordForm, handleInputChange }) => (
    <>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ vựng *</label>
            <input type="text" name="newWord" value={wordForm.newWord} onChange={handleInputChange} required
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa *</label>
            <input type="text" name="meaning" value={wordForm.meaning} onChange={handleInputChange} required
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ví dụ</label>
            <textarea name="example" value={wordForm.example} onChange={handleInputChange} rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại từ</label>
                <select name="wordForm" value={wordForm.wordForm} onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg">
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
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phiên âm</label>
                <input type="text" name="phoneme" value={wordForm.phoneme} onChange={handleInputChange}
                       className="w-full px-4 py-2 border rounded-lg" placeholder="/həˈloʊ/"/>
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh</label>
            <input type="url" name="imageURL" value={wordForm.imageURL} onChange={handleInputChange}
                   className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Âm thanh</label>
            <input type="url" name="audioURL" value={wordForm.audioURL} onChange={handleInputChange}
                   className="w-full px-4 py-2 border rounded-lg" />
        </div>
    </>
);

export default FlashcardDetailPage;
