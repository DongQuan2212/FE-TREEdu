import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axios from 'axios';
import { ArrowLeft, Mic, MicOff, RotateCw, Volume2, SkipForward } from "lucide-react";

const API_URL = process.env.REACT_APP_API_BASE_URL;
const API_FPT = process.env.REACT_APP_FPT_TTS_KEY;
function PronunciationPracticeDetailPage() {
    const { topic } = useParams();
    const decodedTopic = decodeURIComponent(topic);
    const navigate = useNavigate();

    const [sentence, setSentence] = useState('');
    const [loadingSentence, setLoadingSentence] = useState(true);
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [result, setResult] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        fetchRandomSentence();
    }, [decodedTopic]);

    // Đảm bảo load giọng nói cho Web Speech API
    useEffect(() => {
        if ('speechSynthesis' in window) {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                };
            }
        }
    }, []);

    const fetchRandomSentence = async () => {
        try {
            setLoadingSentence(true);
            setResult(null);
            setAudioBlob(null);
            setError(null);

            const res = await axios.get(`${API_URL}/pronunciation-check/random-sentence`, {
                params: { topic: decodedTopic }
            });

            if (res.data.success) {
                setSentence(res.data.data);
            } else {
                setError("Không lấy được câu mẫu.");
            }
        } catch (err) {
            setError("Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setLoadingSentence(false);
        }
    };

    const startRecording = async () => {
        try {
            setError(null);
            setResult(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                sendAudioToBackend(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            setError("Không thể truy cập micro. Vui lòng kiểm tra quyền.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const sendAudioToBackend = async (blob) => {
        setProcessing(true);
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('expectedText', sentence);

        try {
            const res = await axios.post(`${API_URL}/pronunciation-check`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setResult(res.data.data);
            } else {
                setError("Lỗi xử lý. Vui lòng thử lại.");
            }
        } catch (err) {
            setError("Không thể phân tích. Vui lòng thử lại.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReplay = () => fetchRandomSentence();
    const handleBack = () => navigate('/pronunciation-practice');


    const speakSentence = async (text) => {
        if (!text) return;

        if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio = null;
        }

        try {
            const response = await axios.post(
                "https://api.fpt.ai/hmi/tts/v5",
                text,
                {
                    headers: {
                        "api-key": process.env.REACT_APP_FPT_TTS_KEY,
                        "voice": "banmai",
                        "speed": "0",
                        "Content-Type": "text/plain"
                    }
                }
            );

            console.log("FPT response:", response.data);

            const audioUrl = response.data.async;
            console.log("AUDIO URL:", audioUrl);

            if (!audioUrl) throw new Error("FPT không trả URL audio");

            // CHỜ FILE SẴN SÀNG
            const ready = await waitForAudioReady(audioUrl);
            if (!ready) throw new Error("Audio chưa sẵn sàng từ FPT");

            const audio = new Audio(audioUrl);
            window.currentAudio = audio;

            audio.play();

            audio.onended = () => window.currentAudio = null;

        } catch (err) {
            console.error(err);
            setError("FPT lỗi, fallback sang giọng hệ thống");

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "vi-VN";
            window.speechSynthesis.speak(utterance);
        }
    };
    const waitForAudioReady = async (url, retry = 10) => {
        for (let i = 0; i < retry; i++) {
            try {
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Range": "bytes=0-1"
                    }
                });

                if (res.status === 206 || res.status === 200) {
                    return true;
                }
            } catch(err) {
                console.log("Retry...", i);
            }

            await new Promise(r => setTimeout(r, 500));
        }
        return false;
    };
    return (
        <>
            <Header />

            <main className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">

                    <div className="flex items-center justify-between mb-10">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition"
                        >
                            <ArrowLeft size={20} />
                            Quay lại
                        </button>
                        <div className="w-20"></div>
                    </div>

                    {/* Main 2-column layout */}
                    <div className="grid lg:grid-cols-2 gap-10">

                        {/* LEFT: Sentence + Recording */}
                        <div className="space-y-8">
                            {/* Câu mẫu + Nút mới */}
                            <div className="bg-white rounded-xl border border-gray-200 p-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-6 flex items-center gap-2">
                                    <Volume2 size={20} className="text-gray-600" />
                                    Câu cần luyện
                                </h3>
                                {loadingSentence ? (
                                    <div className="space-y-3">
                                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-8 bg-gray-100 rounded animate-pulse w-4/5"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-medium text-gray-900 leading-relaxed">
                                            "{sentence}"
                                        </p>

                                        {/* Nút Nghe mẫu + Câu tiếp theo */}
                                        <div className="flex gap-6 mt-8">
                                            <button
                                                onClick={handleReplay}
                                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700
                                                           border border-gray-300 rounded-lg
                                                           hover:bg-gray-900 hover:text-white hover:border-gray-900
                                                           transition-all duration-300"
                                            >
                                                <SkipForward size={18} />
                                                Câu tiếp theo
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Ghi âm */}
                            <div className="bg-white  border border-gray-200 p-10">
                                {!result ? (
                                    <>
                                        <button
                                            onClick={recording ? stopRecording : startRecording}
                                            disabled={loadingSentence || processing}
                                            className={`w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all
                                                ${recording
                                                ? 'bg-red-500 border-red-500 animate-pulse'
                                                : 'border-gray-400 hover:border-gray-600 hover:scale-105'
                                            } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                                        >
                                            {recording ? (
                                                <MicOff size={48} className="text-white" />
                                            ) : (
                                                <Mic size={48} className="text-gray-700" />
                                            )}
                                        </button>

                                        <p className="mt-6 text-lg font-medium text-gray-700">
                                            {recording ? 'Đang ghi âm...' : 'Nhấn để ghi âm'}
                                        </p>

                                        {processing && (
                                            <p className="mt-4 text-sm text-gray-500">Đang phân tích phát âm...</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-green-600 font-medium text-lg">Đã ghi âm xong</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Result */}
                        <div className="space-y-6">
                            {result ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Kết quả phát âm</h3>

                                    {/* Score */}
                                    <div className="text-center mb-8">
                                        <div className={`text-7xl font-bold ${result.pronunciationScore >= 80 ? 'text-green-600' : result.pronunciationScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {result.pronunciationScore}
                                        </div>
                                        <p className="text-2xl text-gray-600 mt-2">/100</p>
                                    </div>

                                    {/* Recognized Text */}
                                    <div className="bg-gray-50 rounded-lg p-5 mb-6 text-sm">
                                        <p className="text-gray-600">Bạn nói:</p>
                                        <p className="font-medium text-gray-900 mt-1">"{result.recognizedText}"</p>
                                    </div>

                                    {/* Errors */}
                                    {result.pronunciationErrors && result.pronunciationErrors.length > 0 ? (
                                        <div className="space-y-4">
                                            <p className="font-medium text-gray-700">Cần sửa:</p>
                                            {result.pronunciationErrors.map((err, i) => (
                                                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                                                    <p className="font-medium text-red-800">
                                                        "{err.original}" → "{err.recognized}"
                                                    </p>
                                                    <p className="text-red-700 mt-1">{err.explanation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-300 rounded-lg p-6 text-center">
                                            <p className="text-2xl font-bold text-green-700">Xuất sắc!</p>
                                            <p className="text-green-600 mt-2">Phát âm chuẩn hoàn toàn</p>
                                        </div>
                                    )}

                                    {/* Replay Button */}
                                    <button
                                        onClick={handleReplay}
                                        className="mt-8 w-full py-4 border border-gray-300 text-gray-800 rounded-lg font-medium
                                                   hover:bg-gray-900 hover:text-white hover:border-gray-900 transition flex items-center justify-center gap-3"
                                    >
                                        <RotateCw size={20} />
                                        Luyện câu mới
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                                    <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6" />
                                    <p className="text-lg">Ghi âm để xem kết quả phân tích</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-10 p-6 bg-red-50 border border-red-300 rounded-xl text-red-700 text-center font-medium">
                            {error}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default PronunciationPracticeDetailPage;
