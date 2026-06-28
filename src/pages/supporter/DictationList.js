import React, { useState, useEffect } from 'react';
import { Search, Edit2, Headphones, Sparkles, CheckCircle, EyeOff, Check } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { useNavigate } from 'react-router-dom';
import { dictationAPI } from '../../config/api';
import GenerateDictationModal from '../../components/Supporter/GenerateDictationModal';

const DictationList = () => {
    const [dictations, setDictations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showAIModal, setShowAIModal] = useState(false);

    const navigate = useNavigate();

    const fetchDictations = async () => {
        setLoading(true);
        try {
            const res = await dictationAPI.getAllForAdmin();
            if (res.data && res.data.success) {
                setDictations(res.data.data || []);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách bài nghe:', err);
            alert('Không thể tải danh sách bài nghe!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDictations();
    }, []);

    // Đổi trạng thái Ẩn/Hiện
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        try {
            await dictationAPI.updateStatus(id, newStatus);
            // Cập nhật state trực tiếp cho mượt
            setDictations(dictations.map(d => d.id === id ? { ...d, status: newStatus } : d));
        } catch (error) {
            alert('Lỗi cập nhật trạng thái!');
        }
    };

    // Bộ lọc
    const filteredDictations = dictations.filter(d => {
        const matchSearch = (d.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || d.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Headphones className="w-7 h-7 text-blue-600"/>
                                Quản lý Nghe chép chính tả
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Tổng cộng {dictations.length} bài học</p>
                        </div>
                        <button
                            onClick={() => setShowAIModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-md"
                        >
                            <Sparkles className="w-4 h-4"/>
                            Tạo bằng AI (Auto)
                        </button>
                    </div>
                </header>

                <main className="p-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên bài nghe..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="PUBLISHED">Đã Công Khai (Member thấy)</option>
                                <option value="DRAFT">Bản Nháp (Đang ẩn)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>
                        ) : filteredDictations.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">Không có bài nghe nào. Hãy tạo mới bằng AI!</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tiêu đề</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Cấp độ</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Số câu (Segments)</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-600 uppercase">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {filteredDictations.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition text-sm">
                                            <td className="px-5 py-4 font-medium text-gray-900">{item.title}</td>
                                            <td className="px-5 py-4 text-center">
                                                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                                        {item.level}
                                                    </span>
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-600 font-medium">
                                                {item.segments?.length || 0} câu
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {item.status === 'PUBLISHED' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            <CheckCircle className="w-3 h-3" /> Công khai
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                            <EyeOff className="w-3 h-3" /> Bản nháp
                                                        </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => toggleStatus(item.id, item.status)}
                                                        className={`p-1.5 rounded flex items-center gap-1 text-xs font-medium transition ${item.status === 'PUBLISHED' ? 'text-gray-500 hover:bg-gray-200' : 'text-green-600 hover:bg-green-100'}`}
                                                        title={item.status === 'PUBLISHED' ? 'Ẩn bài học' : 'Công khai bài'}
                                                    >
                                                        {item.status === 'PUBLISHED' ? 'Ẩn đi' : <><Check className="w-3 h-3"/> Duyệt</>}
                                                    </button>

                                                    <button
                                                        onClick={() => navigate(`/supporter/dictations/edit/${item.id}`)}
                                                        className="p-1.5 hover:bg-yellow-100 rounded text-yellow-600 transition"
                                                        title="Sửa nội dung"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                {/* Modal tích hợp */}
                <GenerateDictationModal
                    isOpen={showAIModal}
                    onClose={() => setShowAIModal(false)}
                    onSuccess={fetchDictations}
                />
            </div>
        </div>
    );
};

export default DictationList;
