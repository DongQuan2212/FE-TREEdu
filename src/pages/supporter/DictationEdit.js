import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Type, Plus, Trash2, Headphones, Play, Square } from 'lucide-react';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';
import { dictationAPI } from '../../config/api';

const DictationEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('A1');
    const [audioUrl, setAudioUrl] = useState('');
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 🌟 Dùng ref thay vì getElementById để React quản lý đúng cách
    const audioRef = useRef(null);

    // 🌟 Track đoạn đang phát để hiện icon Stop
    const [playingSegmentId, setPlayingSegmentId] = useState(null);
    // Lưu timeout để clear khi cần
    const stopTimerRef = useRef(null);

    useEffect(() => {
        const fetchLessonDetails = async () => {
            try {
                const res = await dictationAPI.getById(id);
                if (res.data && res.data.success) {
                    const lesson = res.data.data;
                    setTitle(lesson.title || '');
                    setLevel(lesson.level || 'A1');
                    setAudioUrl(lesson.audioUrl || '');
                    setSegments(lesson.segments || []);
                }
            } catch (err) {
                console.error("Lỗi lấy chi tiết bài nghe:", err);
                alert("Không thể tải thông tin bài nghe này!");
                navigate('/supporter/dictations');
            } finally {
                setLoading(false);
            }
        };
        fetchLessonDetails();
    }, [id, navigate]);

    // 🌟 Cleanup khi unmount component (tránh memory leak)
    useEffect(() => {
        return () => {
            if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        };
    }, []);

    const stopSegment = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        setPlayingSegmentId(null);
    }, []);

    const seekToTime = useCallback((segId, startTime, endTime) => {
        const audio = audioRef.current;
        if (!audio) {
            alert("Không tìm thấy trình phát âm thanh!");
            return;
        }

        // Nếu đang phát đoạn này thì dừng lại
        if (playingSegmentId === segId) {
            stopSegment();
            return;
        }

        // Clear timer cũ nếu có
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);

        audio.currentTime = startTime;
        audio.play().catch(err => {
            console.warn("Lỗi play audio:", err.message);
        });

        setPlayingSegmentId(segId);

        // 🌟 Tự dừng đúng tại endTime
        const duration = (endTime - startTime) * 1000; // convert sang ms
        stopTimerRef.current = setTimeout(() => {
            audio.pause();
            setPlayingSegmentId(null);
        }, duration);
    }, [playingSegmentId, stopSegment]);

    const handleSegmentChange = (index, field, value) => {
        const updatedSegments = [...segments];
        if (field === 'startTime' || field === 'endTime') {
            updatedSegments[index][field] = parseFloat(value) || 0;
        } else {
            updatedSegments[index][field] = value;
        }
        setSegments(updatedSegments);
    };

    const addNewSegment = () => {
        const newId = segments.length > 0 ? Math.max(...segments.map(s => s.id)) + 1 : 1;
        const lastEndTime = segments.length > 0 ? segments[segments.length - 1].endTime : 0.0;
        setSegments([...segments, {
            id: newId,
            startTime: lastEndTime,
            endTime: lastEndTime + 3.0,
            transcript: ''
        }]);
    };

    const removeSegment = (index) => {
        if (window.confirm("Bạn có chắc muốn xóa đoạn text này không?")) {
            setSegments(segments.filter((_, i) => i !== index));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert("Vui lòng không để trống tên bài nghe!");
            return;
        }
        setSubmitting(true);
        try {
            await dictationAPI.updateLesson(id, { title, level, segments });
            alert("Đã lưu chỉnh sửa thành công!");
            navigate('/supporter/dictations');
        } catch (err) {
            console.error("Lỗi cập nhật bài nghe:", err);
            alert("Cập nhật thất bại! Vui lòng kiểm tra lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <SupporterSidebar />

            <div className="flex-1 ml-72">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/supporter/dictations')}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Hiệu chỉnh bài nghe AI</h1>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {id}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={submitting || loading}
                        className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </header>

                <main className="p-6 max-w-5xl">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Đang tải cấu trúc bài học...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* KHỐI 1: THÔNG TIN CHUNG */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên bài nghe</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cấp độ</label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    >
                                        {['A1','A2','B1','B2','C1'].map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* 🌟 Tự động dùng <video> nếu là mp4, <audio> nếu là audio */}
                                <div className="md:col-span-3 pt-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                                        <Headphones className="w-3.5 h-3.5"/> Luồng âm thanh gốc
                                    </label>

                                    {audioUrl ? (
                                        audioUrl.endsWith('.mp4') ? (
                                            <video
                                                ref={audioRef}
                                                src={audioUrl}
                                                controls
                                                className="w-full rounded-lg bg-gray-50 max-h-48"
                                                onPause={() => {
                                                    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
                                                    setPlayingSegmentId(null);
                                                }}
                                            />
                                        ) : (
                                            <audio
                                                ref={audioRef}
                                                src={audioUrl}
                                                controls
                                                className="w-full h-10 rounded-lg bg-gray-50"
                                                onPause={() => {
                                                    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
                                                    setPlayingSegmentId(null);
                                                }}
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                            Không có file âm thanh
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KHỐI 2: DANH SÁCH SEGMENTS */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-blue-600"/>
                                        Phân đoạn text hội thoại ({segments.length} câu)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addNewSegment}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                                    >
                                        <Plus className="w-3.5 h-3.5"/> Thêm đoạn mới
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-200 p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    {segments.map((seg, index) => {
                                        const isPlaying = playingSegmentId === seg.id;
                                        return (
                                            <div key={index} className="flex flex-col md:flex-row items-start gap-4 pt-4 first:pt-0 group">
                                                <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 mt-1">
                                                    <div className="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-md text-xs w-12 text-center">
                                                        #{seg.id || index + 1}
                                                    </div>
                                                    {/* 🌟 Nút Play/Stop thay đổi theo trạng thái */}
                                                    <button
                                                        type="button"
                                                        onClick={() => seekToTime(seg.id, seg.startTime, seg.endTime)}
                                                        className={`p-1.5 rounded-lg transition border flex items-center justify-center shadow-sm ${
                                                            isPlaying
                                                                ? 'bg-red-50 hover:bg-red-100 text-red-500 border-red-100'
                                                                : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100'
                                                        }`}
                                                        title={isPlaying ? "Dừng lại" : "Nghe đoạn này"}
                                                    >
                                                        {isPlaying
                                                            ? <Square className="w-3 h-3 fill-current" />
                                                            : <Play className="w-3 h-3 fill-current" />
                                                        }
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 mt-1 w-full md:w-auto shrink-0">
                                                    <div className="relative flex items-center">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5"/>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={seg.startTime}
                                                            onChange={(e) => handleSegmentChange(index, 'startTime', e.target.value)}
                                                            className="pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs w-20 text-center focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                                                            title="Giây bắt đầu"
                                                        />
                                                    </div>
                                                    <span className="text-gray-400 text-xs">→</span>
                                                    <div className="relative flex items-center">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5"/>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={seg.endTime}
                                                            onChange={(e) => handleSegmentChange(index, 'endTime', e.target.value)}
                                                            className="pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs w-20 text-center focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                                                            title="Giây kết thúc"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 w-full">
                                                    <textarea
                                                        rows="2"
                                                        value={seg.transcript}
                                                        onChange={(e) => handleSegmentChange(index, 'transcript', e.target.value)}
                                                        placeholder="Nhập nội dung text nghe được..."
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-gray-800"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSegment(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-1 transition md:opacity-0 group-hover:opacity-100"
                                                    title="Xóa đoạn này"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DictationEdit;
