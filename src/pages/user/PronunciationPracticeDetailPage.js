import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../config/axiosConfig";

import {
    ArrowLeft,
    Mic,
    MicOff,
    RotateCw,
    Volume2,
    SkipForward
} from "lucide-react";

function PronunciationPracticeDetailPage() {
    const { topic } = useParams();
    const decodedTopic = decodeURIComponent(topic);
    const navigate = useNavigate();

    /* =======================
       STATE
    ======================= */
    const [sentence, setSentence] = useState("");
    const [loadingSentence, setLoadingSentence] = useState(true);

    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    /* =======================
       LOAD SENTENCE
    ======================= */
    useEffect(() => {
        loadRandomSentence();
        // eslint-disable-next-line
    }, [decodedTopic]);

    const loadRandomSentence = async () => {
        try {
            setLoadingSentence(true);
            setSentence("");
            setResult(null);
            setError(null);

            const res = await axiosInstance.get(
                "/pronunciation-check/random-sentence",
                { params: { topic: decodedTopic } }
            );

            if (res.data?.success === true && typeof res.data.data === "string") {
                setSentence(res.data.data);
            } else {
                throw new Error("Invalid sentence response");
            }
        } catch (err) {
            console.error("Load sentence error:", err);
            setError("Không lấy được câu luyện phát âm.");
        } finally {
            setLoadingSentence(false);
        }
    };

    /* =======================
       RECORD AUDIO
    ======================= */
    const startRecording = async () => {
        try {
            setError(null);
            setResult(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach(track => track.stop());
                sendAudioToBackend(audioBlob);
            };

            recorder.start();
            setRecording(true);
        } catch (err) {
            console.error("Micro error:", err);
            setError("Không thể truy cập micro.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    /* =======================
       SEND AUDIO
    ======================= */
    const sendAudioToBackend = async (audioBlob) => {
        setProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("expectedText", sentence);

        try {
            const res = await axiosInstance.post(
                "/pronunciation-check",
                formData,
                { timeout: 60000 } // ⏱️ AI cần thời gian
            );

            console.log("Pronunciation response:", res.data);

            if (
                res.data?.success === true &&
                res.data?.data &&
                typeof res.data.data.pronunciationScore === "number"
            ) {
                setResult(res.data.data);
            } else {
                console.error("Invalid response structure:", res.data);
                setError("Dữ liệu phân tích không hợp lệ.");
            }

        } catch (err) {
            console.error("Pronunciation API error:", err);

            if (err.code === "ECONNABORTED") {
                setError("Phân tích phát âm mất nhiều thời gian, vui lòng thử lại.");
            } else {
                setError("Không thể chấm phát âm.");
            }
        } finally {
            setProcessing(false);
        }
    };

    /* =======================
       NAVIGATION
    ======================= */
    const handleBack = () => navigate("/pronunciation-practice");
    const handleNextSentence = () => loadRandomSentence();

    /* =======================
       RENDER
    ======================= */
    return (
        <>
            <Header />

            <main className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">

                    {/* BACK */}
                    <div className="mb-10">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                        >
                            <ArrowLeft size={20} />
                            Quay lại
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">

                        {/* LEFT */}
                        <div className="space-y-8">

                            {/* SENTENCE */}
                            <div className="bg-white border rounded-xl p-8">
                                <h3 className="flex items-center gap-2 text-gray-700 mb-6">
                                    <Volume2 size={20} />
                                    Câu cần luyện
                                </h3>

                                {loadingSentence ? (
                                    <div className="h-8 bg-gray-200 animate-pulse rounded" />
                                ) : (
                                    <>
                                        <p className="text-3xl font-medium text-gray-900">
                                            “{sentence}”
                                        </p>

                                        <button
                                            onClick={handleNextSentence}
                                            className="mt-8 flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-900 hover:text-white transition"
                                        >
                                            <SkipForward size={18} />
                                            Câu tiếp theo
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* RECORD */}
                            <div className="bg-white border rounded-xl p-10 text-center">
                                {!result ? (
                                    <>
                                        <button
                                            onClick={recording ? stopRecording : startRecording}
                                            disabled={loadingSentence || processing}
                                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition
                                                ${recording
                                                ? "bg-red-500 border-red-500 animate-pulse"
                                                : "border-gray-400 hover:border-gray-600"}`}
                                        >
                                            {recording
                                                ? <MicOff size={48} className="text-white" />
                                                : <Mic size={48} />}
                                        </button>

                                        <p className="mt-6 text-lg">
                                            {recording ? "Đang ghi âm..." : "Nhấn để ghi âm"}
                                        </p>

                                        {processing && (
                                            <p className="mt-3 text-sm text-gray-500">
                                                AI đang phân tích phát âm, vui lòng chờ...
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-green-600 text-lg font-medium">
                                        Đã phân tích xong
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div>
                            {result ? (
                                <div className="bg-white border rounded-xl p-8">
                                    <h3 className="text-xl font-semibold mb-6">
                                        Kết quả phát âm
                                    </h3>

                                    {/* SCORE */}
                                    <div className="text-center mb-8">
                                        <div
                                            className={`text-7xl font-bold ${
                                                result.pronunciationScore >= 80
                                                    ? "text-green-600"
                                                    : result.pronunciationScore >= 60
                                                        ? "text-yellow-600"
                                                        : "text-red-600"
                                            }`}
                                        >
                                            {result.pronunciationScore}
                                        </div>
                                        <p className="text-xl text-gray-600">/100</p>
                                    </div>

                                    {/* RECOGNIZED */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <p className="text-gray-600">Bạn nói:</p>
                                        <p className="font-medium">
                                            “{result.recognizedText}”
                                        </p>
                                    </div>

                                    {/* ERRORS */}
                                    {result.pronunciationErrors?.length > 0 ? (
                                        <div className="space-y-4">
                                            {result.pronunciationErrors.map((e, i) => (
                                                <div key={i} className="bg-red-50 border rounded-lg p-4">
                                                    <p className="font-medium text-red-800">
                                                        "{e.original || "(thừa)"}" → "{e.recognized}"
                                                    </p>
                                                    <p className="text-red-700 text-sm">
                                                        {e.explanation}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border rounded-lg p-6 text-center">
                                            <p className="text-2xl font-bold text-green-700">
                                                Xuất sắc!
                                            </p>
                                            <p className="text-green-600">
                                                Phát âm rất chuẩn 🎉
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleNextSentence}
                                        className="mt-8 w-full py-4 border rounded-lg hover:bg-gray-900 hover:text-white transition flex justify-center gap-3"
                                    >
                                        <RotateCw size={20} />
                                        Luyện câu mới
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
                                    Ghi âm để xem kết quả
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mt-10 p-6 bg-red-50 border rounded-xl text-red-700 text-center">
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
