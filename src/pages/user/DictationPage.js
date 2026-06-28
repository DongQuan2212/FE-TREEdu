import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';
import Footer from '../../components/Footer/Footer';
import { dictationAPI } from '../../config/api';
import { Headphones, Clock, BookOpen, Search } from 'lucide-react';

const getCloudinaryThumbnail = (audioUrl) => {
    if (!audioUrl || !audioUrl.includes('cloudinary.com')) return null;
    return audioUrl
        .replace('/video/upload/', '/video/upload/so_0,w_400,h_225,c_fill/')
        .replace('.mp4', '.jpg')
        .replace('.mp3', '.jpg');
};

const getLevelBadge = (level) => {
    const style = {
        A1: 'border-green-200 bg-green-50 text-green-700',
        A2: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        B1: 'border-yellow-200 bg-yellow-50 text-yellow-700',
        B2: 'border-orange-200 bg-orange-50 text-orange-700',
        C1: 'border-red-200 bg-red-50 text-red-700',
        C2: 'border-purple-200 bg-purple-50 text-purple-700',
    }[level] || 'border-zinc-200 bg-zinc-50 text-zinc-600';

    return `px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-md ${style}`;
};

function DictationPage() {
    const navigate = useNavigate();
    const [dictations, setDictations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');

    useEffect(() => {
        const fetchDictations = async () => {
            try {
                setLoading(true);
                const res = await dictationAPI.getAllForMember();
                if (res.data?.success) {
                    setDictations(res.data.data || []);
                }
            } catch (err) {
                console.error('Lỗi tải danh sách bài nghe:', err);
                setError('Không thể tải danh sách bài nghe. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchDictations();
    }, []);

    const filteredDictations = dictations.filter(d => {
        const matchSearch = (d.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel = selectedLevel === 'all' || d.level === selectedLevel;
        return matchSearch && matchLevel;
    });

    // Stats tính động
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const availableLevels = levels.filter(l => dictations.some(d => d.level === l));
    const totalSegments = dictations.reduce((sum, d) => sum + (d.segments?.length || 0), 0);

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-52 bg-white border border-zinc-200 rounded-2xl mb-8 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {[1, 2].map(n => <div key={n} className="h-10 bg-gray-100 rounded animate-pulse"></div>)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-zinc-800 font-medium mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition text-sm font-medium"
                        >
                            Thử lại
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
                <div className="max-w-7xl mx-auto mt-8">

                    {/* ── Hero Card ── */}
                    <div className="bg-white border border-zinc-200 rounded-2xl px-7 pt-7 pb-6 mb-8">

                        {/* Title row */}
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
                                    Nghe chép chính tả
                                </h1>
                                <p className="text-zinc-500 text-sm font-light mt-1.5">
                                    Luyện kỹ năng nghe và ghi chép với các bài tập đa dạng cấp độ
                                </p>
                            </div>
                        </div>

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <Headphones className="w-3.5 h-3.5 text-zinc-400" />
                                <span><strong className="text-zinc-800">{dictations.length}</strong> bài nghe</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                                <span><strong className="text-zinc-800">{totalSegments.toLocaleString()}</strong> đoạn luyện tập</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span><strong className="text-zinc-800">{availableLevels.length}</strong> cấp độ</span>
                            </div>
                        </div>

                        {/* Level chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100">
                            <span className="text-xs text-zinc-400 font-medium mr-1">Cấp độ:</span>
                            <button
                                onClick={() => setSelectedLevel('all')}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                    selectedLevel === 'all'
                                        ? 'bg-zinc-900 text-white border-zinc-900'
                                        : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400'
                                }`}
                            >
                                Tất cả
                            </button>
                            {levels.map(l => (
                                <button
                                    key={l}
                                    onClick={() => setSelectedLevel(l)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        selectedLevel === l
                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                            : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400'
                                    }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Filter Bar ── */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        {/* Search */}
                        <div className="flex-grow sm:max-w-sm relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài nghe..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 transition-colors"
                            />
                        </div>
                    </div>

                    {/* ── Section label ── */}
                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-4">
                        {filteredDictations.length} kết quả
                        {selectedLevel !== 'all' && (
                            <span className="ml-1 normal-case">· Cấp độ {selectedLevel}</span>
                        )}
                    </p>

                    {/* ── Card Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDictations.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-400">
                                <Headphones className="w-16 h-16 opacity-20 mb-4" />
                                <p className="text-sm font-medium">Không tìm thấy bài nghe phù hợp.</p>
                            </div>
                        ) : (
                            filteredDictations.map(item => {
                                const thumbnail = getCloudinaryThumbnail(item.audioUrl);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/dictation/${item.id}`)}
                                        className="group bg-white rounded-xl border border-zinc-200 cursor-pointer hover:border-zinc-900 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-full h-36 bg-zinc-100 overflow-hidden">
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : null}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                    <Headphones className="w-5 h-5 text-zinc-800" />
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <span className={getLevelBadge(item.level)}>
                                                    {item.level}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1 justify-between">
                                            <h3 className="text-base font-bold text-zinc-900 mb-3 leading-tight line-clamp-2 group-hover:text-zinc-800 transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5 opacity-60" />
                                                    <span>{item.segments?.length || 0} đoạn</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 opacity-60" />
                                                    <span>
                                                        {item.segments?.length > 0
                                                            ? `~${Math.round(item.segments[item.segments.length - 1].endTime)}s`
                                                            : '—'
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Footer CTA */}
                                            <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                                                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1">
                                                    Luyện ngay
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default DictationPage;
