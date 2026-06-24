// src/pages/supporter/PronunciationTopicList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Eye, Edit2, Trash2, Plus, Mic,
    X, Loader2, Save, MessageSquare, AlertCircle
} from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { pronunciationAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6];

const levelColor = (lv) => {
    const map = {
        1: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
        2: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        3: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
        4: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        5: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
        6: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    };
    return map[lv] || 'bg-gray-100 text-gray-600';
};

const LevelBadge = ({ level }) => (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${levelColor(level)}`}>
        Lv {level ?? '—'}
    </span>
);

const emptyForm = { name: '', description: '', level: 1, sentences: [] };

// ─── Component: Hộp thoại xác nhận xóa Custom Xịn Sò ──────────────────────────

const ConfirmDeleteModal = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center transform animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title || 'Xác nhận hành động'}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">{message}</p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/20 disabled:opacity-60 min-w-[120px]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Đang xóa...' : 'Chắc chắn xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Modal: Tạo / Chỉnh sửa Topic ────────────────────────────────────────────

const TopicModal = ({ topic, onClose, onSaved }) => {
    const isEdit = Boolean(topic);
    const [form, setForm] = useState(isEdit
        ? { name: topic.name, description: topic.description || '', level: topic.level ?? 1, sentences: [] }
        : emptyForm
    );
    const [newSentence, setNewSentence] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const addSentence = () => {
        const s = newSentence.trim();
        if (!s) return;
        set('sentences', [...form.sentences, s]);
        setNewSentence('');
    };

    const removeSentence = (i) => set('sentences', form.sentences.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        if (!form.name.trim()) {
            notify.error('Tên topic không được để trống.');
            return;
        }
        setSaving(true);
        try {
            if (isEdit) {
                await pronunciationAPI.updateTopic(topic.id, {
                    name: form.name,
                    description: form.description,
                    level: form.level,
                });
                notify.success('Cập nhật thông tin topic thành công!');
            } else {
                await pronunciationAPI.createTopic(form);
                notify.success('Tạo mới topic phát âm thành công!');
            }
            onSaved();
            onClose();
        } catch (e) {
            notify.error(e?.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu topic.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        {isEdit ? 'Chỉnh sửa Topic' : 'Tạo Topic mới'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tên topic <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="VD: Giao tiếp văn phòng"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            rows={2}
                            placeholder="Mô tả ngắn gọn về chủ đề này..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cấp độ</label>
                        <select
                            value={form.level}
                            onChange={e => set('level', Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                        >
                            {LEVEL_OPTIONS.map(l => (
                                <option key={l} value={l}>Level {l}</option>
                            ))}
                        </select>
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Câu luyện tập ban đầu
                                <span className="ml-2 text-xs font-normal text-gray-400">({form.sentences.length} câu)</span>
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={newSentence}
                                    onChange={e => setNewSentence(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSentence())}
                                    placeholder="Nhập câu và nhấn Enter hoặc nút +"
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                                <button
                                    onClick={addSentence}
                                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                {form.sentences.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                        Chưa thêm câu nào. Bạn hoàn toàn có thể bổ sung sau.
                                    </p>
                                ) : form.sentences.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                                        <span className="text-xs text-gray-400 font-mono mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
                                        <p className="flex-1 text-sm text-gray-700 leading-relaxed">{s}</p>
                                        <button onClick={() => removeSentence(i)} className="p-1 hover:bg-red-50 rounded text-red-400">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isEdit && (
                        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
                            💡 Để thêm mới hoặc xóa bớt câu luyện tập, vui lòng sử dụng biểu tượng <strong>👁 Xem câu</strong> ở ngoài danh sách bảng.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} disabled={saving} className="px-5 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo chủ đề')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Modal: Xem & Quản lý Sentences ──────────────────────────────────────────

const SentencesModal = ({ topicSummary, onClose, onUpdated }) => {
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [newSentence, setNewSentence] = useState('');
    const [saving, setSaving] = useState(false);

    // State quản lý xóa câu qua Modal xịn
    const [sentenceIndexToDelete, setSentenceIndexToDelete] = useState(null);
    const [isRemovingSentence, setIsRemovingSentence] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoadingDetail(true);
            try {
                const res = await pronunciationAPI.getTopicById(topicSummary.id);
                setDetail(res.data.data);
            } catch {
                notify.error('Không thể tải danh sách chi tiết các câu từ hệ thống.');
                onClose();
            } finally {
                setLoadingDetail(false);
            }
        };
        load();
    }, [topicSummary.id, onClose]);

    const sentences = detail?.sentences || [];

    const handleAdd = async () => {
        const s = newSentence.trim();
        if (!s) return;
        setSaving(true);
        try {
            const res = await pronunciationAPI.addSentences(topicSummary.id, [s]);
            setDetail(res.data.data);
            setNewSentence('');
            notify.success('Đã thêm câu mới thành công!');
            onUpdated();
        } catch {
            notify.error('Gặp lỗi khi thêm câu luyện tập mới.');
        } finally {
            setSaving(false);
        }
    };

    // Hàm kích hoạt xử lý gọi API xóa thực tế
    const executeRemoveSentence = async () => {
        if (sentenceIndexToDelete === null) return;
        setIsRemovingSentence(true);
        try {
            const res = await pronunciationAPI.removeSentence(topicSummary.id, sentenceIndexToDelete);
            setDetail(res.data.data);
            notify.success('Xóa câu thành công.');
            onUpdated();
        } catch {
            notify.error('Gặp lỗi trong quá trình xóa câu.');
        } finally {
            setIsRemovingSentence(false);
            setSentenceIndexToDelete(null); // Đóng modal xác nhận
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{topicSummary.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                            <LevelBadge level={topicSummary.level} />
                            <span>{loadingDetail ? '...' : sentences.length} câu luyện tập</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <div className="px-6 pt-4 pb-3 border-b border-gray-50">
                    <div className="flex gap-2">
                        <input
                            value={newSentence}
                            onChange={e => setNewSentence(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                            placeholder="Nhập câu phát âm mới và nhấn Enter..."
                            disabled={loadingDetail}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none disabled:bg-gray-50"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={saving || !newSentence.trim() || loadingDetail}
                            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition disabled:opacity-50 text-sm font-medium flex items-center gap-1.5"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Thêm
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loadingDetail ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                            <p className="text-sm text-gray-400 mt-2">Đang tải danh sách câu...</p>
                        </div>
                    ) : sentences.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Chưa có câu dữ liệu nào trong topic này.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sentences.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg px-4 py-3">
                                    <span className="text-xs text-gray-400 font-mono mt-0.5 w-6 flex-shrink-0 text-right">{i + 1}.</span>
                                    <p className="flex-1 text-sm text-gray-800 leading-relaxed">{s}</p>
                                    <button
                                        onClick={() => setSentenceIndexToDelete(i)} // Mở confirm modal thay vì dùng window.confirm
                                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 flex-shrink-0 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        Đóng
                    </button>
                </div>
            </div>

            {/* Hộp thoại xác nhận xóa câu lồng bên trong */}
            <ConfirmDeleteModal
                isOpen={sentenceIndexToDelete !== null}
                title="Xóa câu luyện tập"
                message={`Bạn có chắc chắn muốn gỡ bỏ câu luyện tập số #${sentenceIndexToDelete + 1} ra khỏi hệ thống không?`}
                onConfirm={executeRemoveSentence}
                onCancel={() => setSentenceIndexToDelete(null)}
                loading={isRemovingSentence}
            />
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PronunciationTopicList = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');

    const [createModal, setCreateModal] = useState(false);
    const [editTopic, setEditTopic] = useState(null);
    const [sentencesTopic, setSentencesTopic] = useState(null);

    // State quản lý Hộp thoại xóa Topic chính của trang
    const [topicToDelete, setTopicToDelete] = useState(null);
    const [isDeletingTopic, setIsDeletingTopic] = useState(false);

    const fetchTopics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await pronunciationAPI.getAllTopics();
            setTopics(res.data.data || []);
        } catch {
            notify.error('Không thể kết nối để tải danh sách các topic.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTopics(); }, [fetchTopics]);

    // Hàm gọi API thực tế khi Supporter nhấn đồng ý xóa trên bảng thông báo xịn
    const executeDeleteTopic = async () => {
        if (!topicToDelete) return;
        setIsDeletingTopic(true);
        try {
            await pronunciationAPI.deleteTopic(topicToDelete.id);
            notify.success(`Đã xóa thành công chủ đề "${topicToDelete.name}".`);
            fetchTopics();
            setTopicToDelete(null); // Đóng modal
        } catch {
            notify.error('Hệ thống gặp lỗi, không thể xóa chủ đề này.');
        } finally {
            setIsDeletingTopic(false);
        }
    };

    const filtered = topics.filter(t => {
        const matchSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel = filterLevel === 'all' || String(t.level) === filterLevel;
        return matchSearch && matchLevel;
    });

    const totalSentences = topics.reduce((sum, t) => sum + (t.sentenceCount ?? 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Mic className="w-7 h-7" />
                                Quản lý Phát âm
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {topics.length} topic · {totalSentences} câu luyện tập
                            </p>
                        </div>
                        <button
                            onClick={() => setCreateModal(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo topic
                        </button>
                    </div>
                </header>

                <main className="p-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc mô tả..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                            <select
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                {LEVEL_OPTIONS.map(l => (
                                    <option key={l} value={String(l)}>Level {l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-16 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                                <p className="text-gray-500 text-sm mt-3">Đang tải...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-16 text-center">
                                <Mic className="w-14 h-14 mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500 font-medium">Không tìm thấy topic nào</p>
                                <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo bài viết mới.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên topic</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp độ</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số câu</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {filtered.map(topic => (
                                        <tr key={topic.id} className="hover:bg-gray-50 transition text-sm">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-900">{topic.name}</p>
                                            </td>
                                            <td className="px-5 py-4 text-gray-500 max-w-xs">
                                                <p className="truncate">{topic.description || '—'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <LevelBadge level={topic.level} />
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => setSentencesTopic(topic)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-xs font-medium"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    {topic.sentenceCount ?? 0} câu
                                                </button>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSentencesTopic(topic)}
                                                        title="Xem / Quản lý câu"
                                                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditTopic(topic)}
                                                        title="Chỉnh sửa topic"
                                                        className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setTopicToDelete(topic)} // Gọi mở Confirm Modal thay vì window.confirm
                                                        title="Xóa topic"
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
            </div>

            {/* Giao diện các Modal thông tin */}
            {createModal && (
                <TopicModal
                    topic={null}
                    onClose={() => setCreateModal(false)}
                    onSaved={fetchTopics}
                />
            )}
            {editTopic && (
                <TopicModal
                    topic={editTopic}
                    onClose={() => setEditTopic(null)}
                    onSaved={fetchTopics}
                />
            )}
            {sentencesTopic && (
                <SentencesModal
                    topicSummary={sentencesTopic}
                    onClose={() => setSentencesTopic(null)}
                    onUpdated={fetchTopics}
                />
            )}

            {/* Hộp thoại xác nhận xóa Topic của bảng chính */}
            <ConfirmDeleteModal
                isOpen={topicToDelete !== null}
                title="Xóa chủ đề phát âm"
                message={`Hành động này sẽ xóa hoàn toàn topic "${topicToDelete?.name}" cùng toàn bộ dữ liệu các câu phát âm đi kèm. Bạn không thể hoàn tác lại hành động này.`}
                onConfirm={executeDeleteTopic}
                onCancel={() => setTopicToDelete(null)}
                loading={isDeletingTopic}
            />
        </div>
    );
};

export default PronunciationTopicList;
