import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../config/axiosConfig";

import { PawPrint, Users, School, Pizza, Layers, ArrowRight, Mic } from "lucide-react";

const LoadingState = () => (
    <>
        <Header />
        <main className="min-h-screen bg-zinc-50 pt-32 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="h-52 bg-white border border-zinc-200 rounded-2xl mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden animate-pulse">
                            <div className="h-44 bg-zinc-100"></div>
                            <div className="p-6 space-y-3">
                                <div className="h-5 bg-zinc-100 rounded"></div>
                                <div className="h-4 bg-zinc-50 rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
        <Footer />
    </>
);

const ErrorState = ({ message, onRetry }) => (
    <>
        <Header />
        <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <p className="text-zinc-800 font-medium mb-4">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition text-sm font-medium"
                >
                    Thử lại
                </button>
            </div>
        </main>
        <Footer />
    </>
);

const TopicCard = ({ topic, onStart, getIcon, getLevelConfig }) => {
    const levelConfig = getLevelConfig(topic.level);
    const IconComponent = getIcon(topic.name);

    return (
        <article
            onClick={() => onStart(topic.name)}
            className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-900 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
            {/* Icon Header */}
            <div className="relative h-44 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={56} className="text-zinc-300 group-hover:text-emerald-600 transition-colors duration-300" strokeWidth={1.5} />
                </div>

                <span className={`absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${levelConfig.className} ${levelConfig.borderClass}`}>
                    Lv {topic.level}
                </span>

                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                    <Mic size={16} className="text-emerald-600" />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-zinc-900 mb-1.5 text-center group-hover:text-zinc-800 transition-colors leading-tight">
                    {topic.name}
                </h3>
                <p className="text-sm text-zinc-500 text-center line-clamp-2 leading-relaxed mb-5 min-h-[40px]">
                    {topic.description || "Luyện tập phát âm với các từ vựng trong chủ đề này"}
                </p>

                {/* Footer CTA — đồng nhất với FlashCard */}
                <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1">
                        Bắt đầu luyện tập
                        <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </article>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

function PronunciationPracticePage() {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('all');

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axiosInstance.get("/pronunciation-check/topics");
            if (res.data?.success) {
                setTopics(res.data.data);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching topics:", err);
            setError("Bạn vui lòng đăng nhập để sử dụng chức năng này");
        } finally {
            setLoading(false);
        }
    };

    const getTopicIcon = (name) => {
        const iconMap = {
            "Động vật": PawPrint,
            "Gia đình": Users,
            "Trường học": School,
            "Thức ăn": Pizza,
        };
        return iconMap[name] || Layers;
    };

    const getLevelConfig = (level) => {
        const configMap = {
            "1": { className: "bg-green-50 text-green-700", borderClass: "border-green-200" },
            "2": { className: "bg-yellow-50 text-yellow-700", borderClass: "border-yellow-200" },
            "3": { className: "bg-orange-50 text-orange-700", borderClass: "border-orange-200" },
        };
        return configMap[level] || { className: "bg-zinc-50 text-zinc-600", borderClass: "border-zinc-200" };
    };

    const handleStartPractice = (topicName) => {
        navigate(`/pronunciation-practice/${encodeURIComponent(topicName)}`);
    };

    // Stats tính động
    const availableLevels = [...new Set(topics.map(t => t.level).filter(Boolean))].sort();
    const filteredTopics = selectedLevel === 'all'
        ? topics
        : topics.filter(t => String(t.level) === String(selectedLevel));

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={fetchTopics} />;

    return (
        <>
            <Header />

            <main className="min-h-screen bg-zinc-50 pt-28 pb-20 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto mt-8">

                    {/* ── Hero Card ── */}
                    <div className="bg-white border border-zinc-200 rounded-2xl px-7 pt-7 pb-6 mb-8">

                        {/* Title row */}
                        <div className="mb-5">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
                                Luyện tập phát âm
                            </h1>
                            <p className="text-zinc-500 text-sm font-light mt-1.5">
                                Kiểm tra và cải thiện khả năng phát âm Tiếng Việt với công nghệ AI
                            </p>
                        </div>

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                                <span><strong className="text-zinc-800">{topics.length}</strong> chủ đề</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 font-medium">
                                <Mic className="w-3.5 h-3.5 text-zinc-400" />
                                <span><strong className="text-zinc-800">{availableLevels.length}</strong> cấp độ</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs text-emerald-700 font-medium">
                                <span>AI phân tích phát âm</span>
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
                            {availableLevels.map(l => (
                                <button
                                    key={l}
                                    onClick={() => setSelectedLevel(String(l))}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        String(selectedLevel) === String(l)
                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                            : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400'
                                    }`}
                                >
                                    Cấp {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Section label ── */}
                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium mb-4">
                        {filteredTopics.length} chủ đề
                        {selectedLevel !== 'all' && (
                            <span className="ml-1 normal-case">· Cấp {selectedLevel}</span>
                        )}
                    </p>

                    {/* ── Topics Grid ── */}
                    {filteredTopics.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-400">
                            <Layers className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-sm font-medium">Chưa có chủ đề nào ở cấp độ này.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredTopics.map((topic) => (
                                <TopicCard
                                    key={topic.id}
                                    topic={topic}
                                    onStart={handleStartPractice}
                                    getIcon={getTopicIcon}
                                    getLevelConfig={getLevelConfig}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default PronunciationPracticePage;
