import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../config/axiosConfig";

import { PawPrint, Users, School, Pizza, Layers, ArrowRight, Mic } from "lucide-react";

const LoadingState = () => (
    <>
        <Header />
        <main className="min-h-screen bg-neutral-50 pt-32 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 pb-8 border-b border-neutral-200">
                    <div className="h-10 bg-neutral-200 rounded-lg w-64 mb-3 animate-pulse"></div>
                    <div className="h-5 bg-neutral-100 rounded w-96 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                            <div className="h-40 bg-neutral-100 animate-pulse"></div>
                            <div className="p-6 space-y-3">
                                <div className="h-5 bg-neutral-100 rounded animate-pulse"></div>
                                <div className="h-4 bg-neutral-50 rounded w-3/4 animate-pulse"></div>
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
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-neutral-600 mb-6 text-sm">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
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
            className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
        >
            {/* Icon Header with gradient background */}
            <div className="relative h-44 bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center overflow-hidden">
                {/* Animated background blur */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Icon */}
                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={56} className="text-neutral-400 group-hover:text-emerald-600 transition-colors duration-300" strokeWidth={1.5} />
                </div>

                {/* Level Badge */}
                <span className={`absolute top-4 right-4 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full ${levelConfig.className} border ${levelConfig.borderClass}`}>
                    Lv {topic.level}
                </span>

                {/* Mic indicator - appears on hover */}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                    <Mic size={18} className="text-emerald-600" />
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-2 text-center group-hover:text-emerald-600 transition-colors">
                    {topic.name}
                </h3>

                <p className="text-sm text-neutral-500 text-center line-clamp-2 leading-relaxed mb-5 min-h-[40px]">
                    {topic.description || "Luyện tập phát âm với các từ vựng trong chủ đề này"}
                </p>

                {/* Action Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStart(topic.name);
                    }}
                    className="w-full py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                    aria-label={`Bắt đầu luyện tập ${topic.name}`}
                >
                    <span>Bắt đầu luyện tập</span>
                    <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
            "1": {
                className: "bg-emerald-50 text-emerald-700",
                borderClass: "border-emerald-200"
            },
            "2": {
                className: "bg-blue-50 text-blue-700",
                borderClass: "border-blue-200"
            },
            "3": {
                className: "bg-amber-50 text-amber-700",
                borderClass: "border-amber-200"
            },
        };
        return configMap[level] || {
            className: "bg-neutral-100 text-neutral-700",
            borderClass: "border-neutral-200"
        };
    };

    const handleStartPractice = (topicName) => {
        navigate(`/pronunciation-practice/${encodeURIComponent(topicName)}`);
    };

    // ============================================
    // RENDER STATES
    // ============================================

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={fetchTopics} />;

    return (
        <>
            <Header />

            <main className="min-h-screen bg-neutral-50 pt-28 pb-24 px-6 sm:px-8">
                <div className="max-w-7xl mx-auto mt-8">

                    <header className="mb-12 pb-8 border-b border-neutral-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                                    Luyện tập phát âm
                                </h1>
                            </div>
                        </div>
                        <p className="text-neutral-500 text-base leading-relaxed max-w-2xl">
                            Kiểm tra và cải thiện khả năng phát âm Tiếng Việt của bạn với công nghệ AI tiên tiến
                        </p>
                    </header>

                    {/* Topics Grid */}
                    {topics.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                                <Layers size={40} className="text-neutral-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                Chưa có chủ đề nào
                            </h3>
                            <p className="text-neutral-500 text-sm">
                                Các chủ đề luyện tập sẽ sớm được cập nhật
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {topics.map((topic) => (
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
