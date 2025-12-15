import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axios from 'axios';

import { PawPrint, Users, School, Pizza, Layers, ChevronRight, BookOpen } from "lucide-react";

const API_URL = process.env.REACT_APP_API_BASE_URL;

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
            const res = await axios.get(`${API_URL}/pronunciation-check/topics`);
            if (res.data.success) {
                setTopics(res.data.data); // data giờ là array object: [{name, description, level, sentenceCount}, ...]
            }
        } catch (err) {
            setError("Không tải được danh sách chủ đề. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const getTopicIcon = (topicName) => {
        const map = {
            "Động vật": <PawPrint size={48} className="text-gray-600" />,
            "Gia đình": <Users size={48} className="text-gray-600" />,
            "Trường học": <School size={48} className="text-gray-600" />,
            "Thực phẩm": <Pizza size={48} className="text-gray-600" />,
        };
        return map[topicName] || <Layers size={48} className="text-gray-600" />;
    };

    const getLevelColor = (level) => {
        const colors = {
            "A1": "bg-green-100 text-green-800",
            "A2": "bg-blue-100 text-blue-800",
            "B1": "bg-yellow-100 text-yellow-800",
            "B2": "bg-orange-100 text-orange-800",
            "C1": "bg-red-100 text-red-800",
            "C2": "bg-purple-100 text-purple-800",
            "Beginner": "bg-green-100 text-green-800",
            "Intermediate": "bg-yellow-100 text-yellow-800",
            "Advanced": "bg-red-100 text-red-800",
        };
        return colors[level] || "bg-gray-100 text-gray-800";
    };

    const handleStartPractice = (topicName) => {
        navigate(`/pronunciation-practice/${encodeURIComponent(topicName)}`);
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                        <p className="text-gray-600 text-lg">Đang tải chủ đề...</p>
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
                <main className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <p className="text-gray-700 text-lg mb-6">{error}</p>
                        <button onClick={fetchTopics} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
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
            <main className="min-h-screen bg-gray-50 pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-12 py-12 px-8 bg-green-800 rounded-2xl shadow-xl text-white">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            Luyện tập phát âm
                        </h1>
                        <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
                            Kiểm tra khả năng phát âm Tiếng Việt của bạn bằng AI bên mình nào
                        </p>
                    </div>
                    {/* Grid Topics - Card nhỏ gọn, tinh tế */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {topics.length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-500 text-lg">Chưa có chủ đề nào.</p>
                            </div>
                        ) : (
                            topics.map((topic) => (
                                <div
                                    key={topic.id || topic.name}
                                    onClick={() => handleStartPractice(topic.name)}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer
                                               transition-all duration-300 hover:shadow-md hover:border-gray-300 group"
                                >
                                    {/* Icon + Level Badge */}
                                    <div
                                        className="h-32 bg-gray-50 flex items-center justify-center relative border-b border-gray-100">
                                        <div className="transition-transform duration-300 group-hover:scale-110">
                                            {getTopicIcon(topic.name)}
                                        </div>
                                        {topic.level && (
                                            <span
                                                className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${getLevelColor(topic.level)}`}>
                                               level {topic.level}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                            {topic.name}
                                        </h3>

                                        {topic.description && (
                                            <p className="text-xs text-gray-600 text-center line-clamp-2 mb-3">
                                                {topic.description}
                                            </p>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartPractice(topic.name);
                                            }}
                                            className="w-full py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300
                                                       rounded-md hover:bg-gray-900 hover:text-white hover:border-gray-900
                                                       transition-all duration-300 flex items-center justify-center gap-1.5"
                                        >
                                            Bắt đầu luyện
                                            <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer/>
        </>
    );
}

export default PronunciationPracticePage;
