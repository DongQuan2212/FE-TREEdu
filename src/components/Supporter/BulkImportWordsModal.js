import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import axiosInstance from '../../config/axiosConfig';
import fileUrl from "../../asset/file/bangmau.xlsx"
const BulkImportWordsModal = ({ isOpen, onClose, flashcardId, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDownloadTemplate = (e) => {
        e.stopPropagation();

        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", "Mau_Nhap_Lieu_Flashcard.xlsx"); // Tên file user sẽ thấy khi tải về
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ... (Giữ nguyên các hàm xử lý file: handleFileChange, handleDrop, readFile, handleImport) ...
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

            // Logic parse file giữ nguyên
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
        if (file.name.endsWith('.csv')) reader.readAsText(file);
        else reader.readAsArrayBuffer(file);
    };
    const handleImport = async () => {
        if (previewData.length === 0) return;
        setIsProcessing(true);
        setProgress(0);
        setResults({ success: 0, failed: 0, errors: [] });

        const chunkSize = 15;
        const allErrors = [];
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < previewData.length; i += chunkSize) {
            const chunk = previewData.slice(i, i + chunkSize);

            // Tách hàm ra khỏi loop, không capture successCount/failedCount
            const chunkResults = await Promise.all(
                chunk.map((word) =>
                    axiosInstance
                        .post(`/flashcards/${flashcardId}/words`, word)
                        .then(() => ({ success: true }))
                        .catch((err) => ({
                            success: false,
                            word: word.newWord,
                            error: err.response?.data?.message || err.message,
                        }))
                )
            );

            // Cộng dồn sau khi chunk xong — không dùng closure trong map
            for (const r of chunkResults) {
                if (r.success) successCount++;
                else {
                    failedCount++;
                    allErrors.push(`${r.word}: ${r.error}`);
                }
            }

            setProgress(Math.round(((i + chunk.length) / previewData.length) * 100));
            setResults({ success: successCount, failed: failedCount, errors: [...allErrors] });
        }

        setIsProcessing(false);
        if (successCount > 0) onSuccess?.();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-7 h-7 text-green-600" />
                            Nhập từ vựng hàng loạt
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 ml-10">Hỗ trợ file Excel (.xlsx) hoặc CSV</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-8 space-y-8">
                    {!file ? (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="group border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 hover:bg-green-50/30 transition-all cursor-pointer relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Kéo thả file vào đây</h3>
                            <p className="text-gray-500 mb-6">hoặc click để chọn file từ máy tính</p>
                            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />

                            {/* Nút Download File Mẫu (Đã cập nhật) */}
                            <div className="inline-flex items-center justify-center mt-2">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-green-500 hover:text-green-600 transition shadow-sm text-sm font-medium z-20 relative"
                                >
                                    <Download size={16} />
                                    Tải file mẫu chuẩn (.xlsx)
                                </button>
                            </div>
                        </div>
                    ) : (
                        // ... Phần UI khi đã chọn file giữ nguyên ...
                        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg"><FileText className="w-8 h-8 text-green-700" /></div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{file.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><CheckCircle2 size={14} className="text-green-500" /><span>Đã tìm thấy <b>{previewData.length}</b> từ hợp lệ</span></div>
                                </div>
                            </div>
                            <button onClick={() => { setFile(null); setPreviewData([]); setResults({ success: 0, failed: 0, errors: [] }); }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition">Thay file khác</button>
                        </div>
                    )}

                    {/* ... Các phần Preview Table, Progress, Result, Footer giữ nguyên ... */}
                    {previewData.length > 0 && !isProcessing && results.success === 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-700 border-b border-gray-200 flex justify-between items-center">
                                <span>Xem trước dữ liệu</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">Hiển thị tối đa 10 dòng đầu</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Từ vựng</th>
                                        <th className="px-6 py-3 font-medium">Nghĩa</th>
                                        <th className="px-6 py-3 font-medium">Loại từ</th>
                                        <th className="px-6 py-3 font-medium">Phiên âm</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                    {previewData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-bold text-gray-800">{row.newWord}</td>
                                            <td className="px-6 py-3 text-gray-700">{row.meaning}</td>
                                            <td className="px-6 py-3 text-gray-500 italic">{row.wordForm || '—'}</td>
                                            <td className="px-6 py-3 text-gray-500 font-mono">{row.phoneme || '—'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {isProcessing && (
                        <div className="space-y-4 py-8">
                            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4"/> Đang xử lý...</span>
                                <span>{Math.round((results.success + results.failed) / previewData.length * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-green-600 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                    {!isProcessing && (results.success > 0 || results.failed > 0) && (
                        <div className="space-y-4">
                            <div className={`p-6 rounded-xl border ${results.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                <div className="flex items-start gap-4">
                                    {results.failed === 0 ? <CheckCircle2 className="w-6 h-6 text-green-600 mt-1"/> : <AlertCircle className="w-6 h-6 text-orange-600 mt-1"/>}
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg ${results.failed === 0 ? 'text-green-900' : 'text-orange-900'}`}>{results.failed === 0 ? 'Nhập liệu hoàn tất!' : 'Hoàn tất với một số lỗi'}</h3>
                                        <div className="mt-2 flex gap-6 text-sm">
                                            <span className="text-green-700 font-medium">✓ Thành công: {results.success}</span>
                                            {results.failed > 0 && <span className="text-red-600 font-medium">✕ Thất bại: {results.failed}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {results.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 max-h-40 overflow-y-auto text-sm">
                                    <ul className="list-disc list-inside space-y-1 text-red-700">{results.errors.map((err, idx) => (<li key={idx}>{err}</li>))}</ul>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={onClose} disabled={isProcessing} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">{results.success > 0 ? 'Đóng' : 'Hủy bỏ'}</button>
                        {file && !isProcessing && results.success === 0 && (
                            <button onClick={handleImport} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm"><Upload className="w-4 h-4" /> Bắt đầu nhập {previewData.length} từ</button>
                        )}
                        {results.success > 0 && !isProcessing && (
                            <button onClick={() => { onClose(); onSuccess?.(); }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-md transition text-sm">Hoàn tất</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkImportWordsModal;
