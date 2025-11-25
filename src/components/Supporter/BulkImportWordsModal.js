// src/components/Supporter/BulkImportWordsModal.js
import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Loader2, FileText } from 'lucide-react';
import * as XLSX from 'xlsx'; // Cài: npm install xlsx

const BulkImportWordsModal = ({ isOpen, onClose, flashcardId, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        readFile(uploadedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
            setFile(droppedFile);
            readFile(droppedFile);
        }
    };

    const readFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            // Bỏ qua header
            const parsed = rows.slice(1).map(row => ({
                newWord: (row[0] || '').toString().trim(),
                meaning: (row[1] || '').toString().trim(),
                wordForm: (row[2] || '').toString().trim(),
                phoneme: (row[3] || '').toString().trim(),
                imageURL: (row[4] || '').toString().trim(),
                audioURL: (row[5] || '').toString().trim(),
            })).filter(row => row.newWord && row.meaning);

            setPreviewData(parsed);
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setIsProcessing(true);
        setProgress(0);
        setResults({ success: 0, failed: 0, errors: [] });

        const chunkSize = 15;
        const errors = [];

        for (let i = 0; i < previewData.length; i += chunkSize) {
            const chunk = previewData.slice(i, i + chunkSize);
            const promises = chunk.map(async (word) => {
                try {
                    const res = await fetch(`http://localhost:3001/flashcards/${flashcardId}/words`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(word)
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return { success: true, word: word.newWord };
                } catch (err) {
                    return { success: false, word: word.newWord, error: err.message };
                }
            });

            const chunkResults = await Promise.all(promises);
            chunkResults.forEach(r => {
                if (r.success) setResults(prev => ({ ...prev, success: prev.success + 1 }));
                else {
                    setResults(prev => ({ ...prev, failed: prev.failed + 1 }));
                    errors.push(`${r.word}: ${r.error}`);
                }
            });

            setProgress(Math.min(100, Math.round(((i + chunkSize) / previewData.length) * 100)));
        }

        setResults(prev => ({ ...prev, errors }));
        setIsProcessing(false);
        onSuccess?.();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        Upload file CSV / Excel
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Upload Zone */}
                    {!file ? (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-green-500 transition cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-medium text-gray-700">Kéo & thả file vào đây</p>
                            <p className="text-sm text-gray-500 mt-2">hoặc click để chọn file (.csv, .xlsx)</p>
                            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
                        </div>
                    ) : (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-center gap-4">
                            <FileText className="w-12 h-12 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-900">{file.name}</p>
                                <p className="text-sm text-green-700">{previewData.length} từ được phát hiện</p>
                            </div>
                            <button onClick={() => { setFile(null); setPreviewData([]); }} className="ml-auto text-green-600 hover:text-green-800">
                                Thay file
                            </button>
                        </div>
                    )}

                    {/* Preview */}
                    {previewData.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 font-medium">Xem trước ({previewData.length} từ)</div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Từ vựng</th>
                                        <th className="px-4 py-3 text-left">Nghĩa</th>
                                        <th className="px-4 py-3 text-left">Loại từ</th>
                                        <th className="px-4 py-3 text-left">Phiên âm</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {previewData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{row.newWord}</td>
                                            <td className="px-4 py-3">{row.meaning}</td>
                                            <td className="px-4 py-3 text-gray-600">{row.wordForm || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{row.phoneme || '—'}</td>
                                        </tr>
                                    ))}
                                    {previewData.length > 10 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-3 text-center text-gray-500 italic">
                                                ... và {previewData.length - 10} từ khác
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Progress */}
                    {isProcessing && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Đang thêm từ...</span>
                                <span>{results.success + results.failed} / {previewData.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div className="bg-green-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${progress}%` }}>
                                    {progress}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {!isProcessing && results.success > 0 && (
                        <div className={`p-5 rounded-xl border ${results.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="font-bold text-green-900">Hoàn thành!</p>
                                    <p>Thành công: <strong>{results.success}</strong> | Thất bại: <strong>{results.failed}</strong></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button onClick={onClose} className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
                            Đóng
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!file || isProcessing || previewData.length === 0}
                            className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 transition flex items-center gap-3"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            {isProcessing ? 'Đang xử lý...' : `Thêm ${previewData.length} từ`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkImportWordsModal;
