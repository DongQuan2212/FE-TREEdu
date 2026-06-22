import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Play, Square, RotateCcw, ChevronRight, Eye, CheckCircle2,
    XCircle, Trophy, ArrowLeft, Volume2, Mic
} from 'lucide-react';
import Header from '../../components/user/Header';
import Footer from '../../components/Footer/Footer';
import { dictationAPI } from '../../config/api';
import { notify } from '../../utils/toastNotify';


const countWords = (text) => {
    if (!text) return [];
    return text.trim().split(/\s+/).filter(Boolean);
};


const ResultScreen = ({ results, lesson, onRestart, onBack }) => {
    const totalSegments = results.length;
    const passedSegments = results.filter(r => r.passed).length;
    const avgAccuracy = totalSegments > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / totalSegments)
        : 0;

    const grade = avgAccuracy >= 90 ? { label: 'Xuất sắc', color: '#059669', icon: '🏆' }
        : avgAccuracy >= 80 ? { label: 'Tốt', color: '#0284c7', icon: '🎯' }
            : avgAccuracy >= 60 ? { label: 'Khá', color: '#d97706', icon: '📈' }
                : { label: 'Cần luyện thêm', color: '#dc2626', icon: '💪' };

    return (
        <div style={{
            minHeight: '100vh', background: '#f8fafc',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '2rem', fontFamily: "'Be Vietnam Pro', sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{
                background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0',
                padding: '3rem', maxWidth: 560, width: '100%', textAlign: 'center'
            }}>
                <div style={{ fontSize: 64, marginBottom: '1rem' }}>{grade.icon}</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    Hoàn thành!
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>{lesson?.title}</p>

                {/* Điểm tổng */}
                <div style={{
                    background: '#f8fafc', borderRadius: 16, padding: '2rem',
                    marginBottom: '1.5rem', border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: 64, fontWeight: 700, color: grade.color, lineHeight: 1 }}>
                        {avgAccuracy}%
                    </div>
                    <div style={{
                        display: 'inline-block', marginTop: 8, padding: '4px 16px',
                        borderRadius: 100, background: grade.color + '15',
                        color: grade.color, fontWeight: 600, fontSize: 14
                    }}>
                        {grade.label}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '2rem' }}>
                    <div style={{
                        background: '#f0fdf4', borderRadius: 12, padding: '1rem',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>{passedSegments}</div>
                        <div style={{ fontSize: 13, color: '#16a34a', marginTop: 2 }}>Đoạn đạt ✓</div>
                    </div>
                    <div style={{
                        background: '#fef2f2', borderRadius: 12, padding: '1rem',
                        border: '1px solid #fecaca'
                    }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>
                            {totalSegments - passedSegments}
                        </div>
                        <div style={{ fontSize: 13, color: '#dc2626', marginTop: 2 }}>Cần luyện lại</div>
                    </div>
                </div>

                {/* Chi tiết từng đoạn */}
                <div style={{
                    maxHeight: 200, overflowY: 'auto', marginBottom: '1.5rem',
                    border: '1px solid #e2e8f0', borderRadius: 12
                }}>
                    {results.map((r, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 16px',
                            borderBottom: i < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                            background: '#fff'
                        }}>
                            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                                Đoạn #{i + 1}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    fontSize: 13, fontWeight: 600,
                                    color: r.passed ? '#059669' : '#dc2626'
                                }}>
                                    {r.accuracy != null ? r.accuracy.toFixed(1) : 0}%
                                </span>
                                {r.passed
                                    ? <CheckCircle2 size={14} color="#059669" />
                                    : <XCircle size={14} color="#dc2626" />
                                }
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onRestart}
                        style={{
                            flex: 1, padding: '12px', borderRadius: 12,
                            border: '1px solid #e2e8f0', background: '#fff',
                            color: '#0f172a', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}
                    >
                        Làm lại
                    </button>
                    <button
                        onClick={onBack}
                        style={{
                            flex: 1, padding: '12px', borderRadius: 12,
                            border: 'none', background: '#059669',
                            color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}
                    >
                        Về danh sách
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Component chính ───────────────────────────────────────────────────────────
function DictationPractice() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSegIndex, setCurrentSegIndex] = useState(0);
    const [userText, setUserText] = useState('');
    const [checkResult, setCheckResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const [listenCount, setListenCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [results, setResults] = useState([]);
    const [finished, setFinished] = useState(false);
    const [speed, setSpeed] = useState(1);

    const audioRef = useRef(null);
    const stopTimerRef = useRef(null);
    const textareaRef = useRef(null);

    const MAX_LISTEN = 3;
    const PASS_ACCURACY = 80;

    // Load lesson
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await dictationAPI.getById(id);
                if (res.data?.success) {
                    setLesson(res.data.data);
                }
            } catch {
                notify.error('Không thể tải bài nghe!');
                navigate('/dictation');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, navigate]);

    // Cleanup timer
    useEffect(() => () => { if (stopTimerRef.current) clearTimeout(stopTimerRef.current); }, []);

    const currentSeg = lesson?.segments?.[currentSegIndex];
    const totalSegs = lesson?.segments?.length || 0;
    const progressPct = totalSegs > 0 ? Math.round((currentSegIndex / totalSegs) * 100) : 0;

    // Phát đoạn hiện tại
    const playCurrentSegment = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !currentSeg) return;
        if (listenCount >= MAX_LISTEN) {
            notify.warning(`Đã nghe tối đa ${MAX_LISTEN} lần cho đoạn này!`);
            return;
        }

        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);

        audio.playbackRate = speed;
        audio.currentTime = currentSeg.startTime;
        audio.play().catch(e => console.warn(e));
        setIsPlaying(true);
        setListenCount(prev => prev + 1);

        const duration = (currentSeg.endTime - currentSeg.startTime) * 1000 / speed;
        stopTimerRef.current = setTimeout(() => {
            audio.pause();
            setIsPlaying(false);
            // Focus textarea sau khi nghe xong
            setTimeout(() => textareaRef.current?.focus(), 100);
        }, duration);
    }, [currentSeg, listenCount, speed]);

    // Dừng
    const stopAudio = useCallback(() => {
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    // Check đáp án
    const handleCheck = async () => {
        if (!userText.trim()) {
            notify.warning('Bạn chưa nhập gì cả!');
            return;
        }
        setChecking(true);
        try {
            const res = await dictationAPI.checkAnswer(id, {
                segmentId: currentSeg.id,
                userText: userText.trim()
            });
            const data = res.data?.data;
            setCheckResult(data);

            if (data.passed) {
                notify.success(`Chính xác ${data.accuracy.toFixed(1)}% — Tuyệt vời! 🎉`);
            } else {
                notify.error(`Chỉ đạt ${data.accuracy.toFixed(1)}% — Cần ${PASS_ACCURACY}% để qua!`);
            }
        } catch {
            notify.error('Lỗi kiểm tra đáp án!');
        } finally {
            setChecking(false);
        }
    };

    // Xem đáp án (trừ điểm)
    const handleShowAnswer = () => {
        if (!currentSeg) return;
        setShowAnswer(true);
        // Lưu kết quả với accuracy = 0 vì xem đáp án
        setCheckResult({
            accuracy: 0,
            passed: false,
            correctAnswer: currentSeg.transcript,
            wordDetails: [],
            revealedAnswer: true
        });
        notify.warning('Đã hiện đáp án — đoạn này tính 0 điểm');
    };

    // Qua đoạn tiếp
    const handleNext = () => {
        const result = checkResult || { accuracy: 0, passed: false };
        const newResults = [...results, {
            segmentId: currentSeg?.id,
            accuracy: result.accuracy || 0,
            passed: result.passed || false
        }];
        setResults(newResults);

        if (currentSegIndex + 1 >= totalSegs) {
            setFinished(true);
        } else {
            setCurrentSegIndex(prev => prev + 1);
            setUserText('');
            setCheckResult(null);
            setListenCount(0);
            setShowAnswer(false);
            stopAudio();
        }
    };

    // Restart
    const handleRestart = () => {
        setCurrentSegIndex(0);
        setUserText('');
        setCheckResult(null);
        setListenCount(0);
        setShowAnswer(false);
        setResults([]);
        setFinished(false);
        stopAudio();
    };

    // Keyboard shortcut: Enter để check, Ctrl+Enter để next
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            if (checkResult) return;
            handleCheck();
        }
        if (e.ctrlKey && e.key === 'Enter' && checkResult) {
            e.preventDefault();
            handleNext();
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: '#f8fafc'
                }}>
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            border: '3px solid #e2e8f0', borderTop: '3px solid #059669',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                        }} />
                        Đang tải bài nghe...
                    </div>
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
        );
    }

    if (finished) {
        return (
            <>
                <Header />
                <ResultScreen
                    results={results}
                    lesson={lesson}
                    onRestart={handleRestart}
                    onBack={() => navigate('/dictation')}
                />
            </>
        );
    }

    const words = countWords(currentSeg?.transcript || '');
    const listenLeft = MAX_LISTEN - listenCount;

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
                .seg-card { transition: all 0.2s; }
                .seg-card:hover { border-color: #94a3b8 !important; }
                .practice-textarea:focus { outline: none; border-color: #059669 !important; box-shadow: 0 0 0 3px #059669'20' !important; }
            `}</style>

            <Header />

            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={lesson?.audioUrl}
                onPause={() => { if (stopTimerRef.current) clearTimeout(stopTimerRef.current); setIsPlaying(false); }}
                style={{ display: 'none' }}
            />

            <main style={{
                minHeight: '100vh', background: '#f8fafc', paddingTop: 96,
                paddingBottom: 40, fontFamily: "'Be Vietnam Pro', sans-serif"
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 0' }}>

                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <button
                            onClick={() => navigate('/dictation')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 8,
                                border: '1px solid #e2e8f0', background: '#fff',
                                color: '#475569', fontSize: 13, cursor: 'pointer',
                                fontFamily: 'inherit', fontWeight: 500
                            }}
                        >
                            <ArrowLeft size={14} /> Danh sách
                        </button>
                        <span style={{ color: '#cbd5e1', fontSize: 13 }}>›</span>
                        <span style={{
                            fontSize: 13, color: '#0f172a', fontWeight: 600,
                            maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                            {lesson?.title}
                        </span>
                        <span style={{
                            marginLeft: 'auto', fontSize: 12, padding: '3px 10px',
                            borderRadius: 100, background: '#fef3c7', color: '#92400e', fontWeight: 600
                        }}>
                            {lesson?.level}
                        </span>
                    </div>

                    {/* Progress tổng */}
                    <div style={{
                        background: '#fff', borderRadius: 12, padding: '12px 20px',
                        border: '1px solid #e2e8f0', marginBottom: 20,
                        display: 'flex', alignItems: 'center', gap: 16
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                            Đoạn {currentSegIndex + 1} / {totalSegs}
                        </span>
                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', background: '#059669', borderRadius: 3,
                                width: `${progressPct}%`, transition: 'width 0.4s ease'
                            }} />
                        </div>
                        <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{progressPct}%</span>
                    </div>

                    {/* 3 cột chính */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 280px', gap: 16, alignItems: 'start' }}>

                        {/* ── CỘT TRÁI: Audio player ───────────────────────────────── */}
                        <div style={{
                            background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                            padding: 20, display: 'flex', flexDirection: 'column', gap: 16
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Volume2 size={16} color="#059669" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Phát âm thanh</span>
                            </div>

                            {/* Thumbnail / audio visual */}
                            <div style={{
                                width: '100%', aspectRatio: '16/9', borderRadius: 12,
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                gap: 12, position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Animated rings khi đang play */}
                                {isPlaying && (
                                    <>
                                        <div style={{
                                            position: 'absolute', width: 120, height: 120,
                                            borderRadius: '50%', border: '1px solid rgba(5,150,105,0.3)',
                                            animation: 'ping 1.5s ease-out infinite'
                                        }} />
                                        <div style={{
                                            position: 'absolute', width: 80, height: 80,
                                            borderRadius: '50%', border: '1px solid rgba(5,150,105,0.4)',
                                            animation: 'ping 1.5s ease-out 0.5s infinite'
                                        }} />
                                    </>
                                )}
                                <style>{`
                                    @keyframes ping {
                                        0% { transform: scale(1); opacity: 1; }
                                        100% { transform: scale(2); opacity: 0; }
                                    }
                                `}</style>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    background: isPlaying ? '#059669' : 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.3s', border: '2px solid rgba(255,255,255,0.2)'
                                }}>
                                    <Mic size={22} color="#fff" />
                                </div>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                    {isPlaying ? 'Đang phát...' : `Đoạn ${currentSegIndex + 1}`}
                                </span>
                            </div>

                            {/* Nút play / stop */}
                            <button
                                onClick={isPlaying ? stopAudio : playCurrentSegment}
                                disabled={!isPlaying && listenCount >= MAX_LISTEN}
                                style={{
                                    width: '100%', padding: '12px',
                                    borderRadius: 12, border: 'none',
                                    background: isPlaying ? '#dc2626'
                                        : listenCount >= MAX_LISTEN ? '#e2e8f0' : '#059669',
                                    color: listenCount >= MAX_LISTEN && !isPlaying ? '#94a3b8' : '#fff',
                                    fontWeight: 600, fontSize: 14, cursor: listenCount >= MAX_LISTEN && !isPlaying ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 8, fontFamily: 'inherit', transition: 'background 0.2s'
                                }}
                            >
                                {isPlaying
                                    ? <><Square size={15} fill="#fff" /> Dừng</>
                                    : <><Play size={15} fill="#fff" /> {listenCount === 0 ? 'Nghe đoạn này' : 'Nghe lại'}</>
                                }
                            </button>

                            {/* Lượt nghe còn lại */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}>
                                {Array.from({ length: MAX_LISTEN }).map((_, i) => (
                                    <div key={i} style={{
                                        width: 28, height: 6, borderRadius: 3,
                                        background: i < listenCount ? '#dc2626' : '#dcfce7',
                                        border: `1px solid ${i < listenCount ? '#fca5a5' : '#86efac'}`,
                                        transition: 'background 0.3s'
                                    }} />
                                ))}
                                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
                                    {listenLeft > 0 ? `còn ${listenLeft} lượt` : 'hết lượt'}
                                </span>
                            </div>

                            {/* Tốc độ phát */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 6
                            }}>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Tốc độ:</span>
                                {[0.75, 1, 1.25].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSpeed(s)}
                                        style={{
                                            padding: '3px 10px', borderRadius: 6,
                                            border: `1px solid ${speed === s ? '#059669' : '#e2e8f0'}`,
                                            background: speed === s ? '#f0fdf4' : '#fff',
                                            color: speed === s ? '#059669' : '#64748b',
                                            fontSize: 12, fontWeight: speed === s ? 600 : 400,
                                            cursor: 'pointer', fontFamily: 'inherit'
                                        }}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── CỘT GIỮA: Nhập liệu ──────────────────────────────────── */}
                        <div style={{
                            background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                            padding: 20, display: 'flex', flexDirection: 'column', gap: 16
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Mic size={16} color="#059669" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                    Gõ những gì bạn nghe được
                                </span>
                            </div>

                            {/* Gợi ý số từ bằng *** */}
                            <div style={{
                                padding: '12px 16px', background: '#f8fafc',
                                borderRadius: 10, border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>
                                    GỢI Ý — {words.length} từ
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}>
                                    {words.map((word, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            {showAnswer ? (
                                                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                                                    {word}
                                                </span>
                                            ) : (
                                                Array.from({ length: Math.min(word.length, 6) }).map((_, j) => (
                                                    <div key={j} style={{
                                                        width: 5, height: 5, borderRadius: '50%',
                                                        background: '#cbd5e1'
                                                    }} />
                                                ))
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Textarea nhập */}
                            <textarea
                                ref={textareaRef}
                                value={userText}
                                onChange={e => { if (!checkResult) setUserText(e.target.value); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Gõ câu trả lời của bạn ở đây..."
                                disabled={!!checkResult}
                                rows={4}
                                style={{
                                    width: '100%', padding: '14px 16px',
                                    borderRadius: 12, border: `1.5px solid ${checkResult
                                        ? (checkResult.passed ? '#86efac' : '#fca5a5')
                                        : '#e2e8f0'}`,
                                    fontSize: 15, color: '#0f172a', resize: 'none',
                                    fontFamily: 'inherit', background: checkResult ? '#f8fafc' : '#fff',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                                    lineHeight: 1.6
                                }}
                            />

                            {/* Kết quả check — hiện từng từ */}
                            {checkResult && !checkResult.revealedAnswer && (
                                <div style={{
                                    padding: '14px 16px', background: checkResult.passed ? '#f0fdf4' : '#fef2f2',
                                    borderRadius: 12,
                                    border: `1px solid ${checkResult.passed ? '#bbf7d0' : '#fecaca'}`,
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10
                                    }}>
                                        {checkResult.passed
                                            ? <CheckCircle2 size={18} color="#059669" />
                                            : <XCircle size={18} color="#dc2626" />
                                        }
                                        <span style={{
                                            fontWeight: 700, fontSize: 15,
                                            color: checkResult.passed ? '#059669' : '#dc2626'
                                        }}>
                                            {checkResult.accuracy.toFixed(1)}%
                                            {checkResult.passed ? ' — Đạt yêu cầu!' : ` — Chưa đạt (cần ${PASS_ACCURACY}%)`}
                                        </span>
                                    </div>
                                    {/* Từng từ đúng/sai */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {checkResult.wordDetails?.map((wd, i) => (
                                            <span key={i} style={{
                                                padding: '3px 10px', borderRadius: 6, fontSize: 13,
                                                fontWeight: 500,
                                                background: wd.status === 'CORRECT' ? '#dcfce7' : '#fee2e2',
                                                color: wd.status === 'CORRECT' ? '#166534' : '#991b1b',
                                                border: `1px solid ${wd.status === 'CORRECT' ? '#86efac' : '#fca5a5'}`
                                            }}>
                                                {wd.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Đáp án đúng khi xem */}
                            {checkResult?.revealedAnswer && (
                                <div style={{
                                    padding: '14px 16px', background: '#fffbeb',
                                    borderRadius: 12, border: '1px solid #fde68a',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 6 }}>
                                        ĐÁP ÁN ĐÚNG
                                    </div>
                                    <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.7 }}>
                                        {checkResult.correctAnswer}
                                    </div>
                                </div>
                            )}

                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                {!checkResult
                                    ? 'Nhấn Enter để kiểm tra • Ctrl+Enter để qua tiếp'
                                    : 'Ctrl+Enter để qua đoạn tiếp theo'}
                            </div>

                            {/* Nút hành động */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {!checkResult ? (
                                    <>
                                        <button
                                            onClick={handleCheck}
                                            disabled={checking || !userText.trim()}
                                            style={{
                                                padding: '13px', borderRadius: 12, border: 'none',
                                                background: checking || !userText.trim() ? '#e2e8f0' : '#059669',
                                                color: checking || !userText.trim() ? '#94a3b8' : '#fff',
                                                fontWeight: 600, fontSize: 14, cursor: checking || !userText.trim() ? 'not-allowed' : 'pointer',
                                                fontFamily: 'inherit', transition: 'background 0.2s'
                                            }}
                                        >
                                            {checking ? 'Đang kiểm tra...' : 'Kiểm tra đáp án'}
                                        </button>
                                        <button
                                            onClick={handleShowAnswer}
                                            style={{
                                                padding: '11px', borderRadius: 12,
                                                border: '1px solid #fca5a5', background: '#fff',
                                                color: '#dc2626', fontWeight: 500, fontSize: 13,
                                                cursor: 'pointer', fontFamily: 'inherit',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: 6
                                            }}
                                        >
                                            <Eye size={14} /> Hiện đáp án (tính 0 điểm đoạn này)
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        style={{
                                            padding: '13px', borderRadius: 12, border: 'none',
                                            background: '#0f172a', color: '#fff',
                                            fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: 8
                                        }}
                                    >
                                        {currentSegIndex + 1 >= totalSegs
                                            ? <><Trophy size={15} /> Xem kết quả</>
                                            : <><ChevronRight size={15} /> Đoạn tiếp theo</>
                                        }
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── CỘT PHẢI: Bản chép ───────────────────────────────────── */}
                        <div style={{
                            background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                            padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
                            maxHeight: 560, overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Bản chép</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>
                                    {results.length > 0
                                        ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length) + '%'
                                        : '—'
                                    }
                                </span>
                            </div>

                            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                                {lesson?.segments?.map((seg, i) => {
                                    const segResult = results[i];
                                    const isCurrent = i === currentSegIndex;
                                    const isDone = i < currentSegIndex;
                                    const segWords = countWords(seg.transcript);

                                    return (
                                        <div
                                            key={seg.id}
                                            className="seg-card"
                                            style={{
                                                padding: '10px 12px', borderRadius: 10,
                                                border: `1px solid ${isCurrent ? '#059669'
                                                    : isDone && segResult?.passed ? '#86efac'
                                                        : isDone ? '#fca5a5' : '#e2e8f0'}`,
                                                background: isCurrent ? '#f0fdf4'
                                                    : isDone && segResult?.passed ? '#f0fdf4'
                                                        : isDone ? '#fef2f2' : '#f8fafc'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between', marginBottom: 6
                                            }}>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 600,
                                                    color: isCurrent ? '#059669' : isDone ? (segResult?.passed ? '#059669' : '#dc2626') : '#94a3b8'
                                                }}>
                                                    #{seg.id}
                                                    {isCurrent && ' — đang làm'}
                                                </span>
                                                {isDone && (
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600,
                                                        color: segResult?.passed ? '#059669' : '#dc2626'
                                                    }}>
                                                        {segResult?.accuracy?.toFixed(0)}%
                                                    </span>
                                                )}
                                            </div>
                                            {/* Dots gợi ý số từ */}
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {segWords.map((_, j) => (
                                                    <div key={j} style={{
                                                        width: 6, height: 6, borderRadius: '50%',
                                                        background: isDone
                                                            ? (segResult?.passed ? '#86efac' : '#fca5a5')
                                                            : isCurrent ? '#6ee7b7'
                                                                : '#e2e8f0'
                                                    }} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Nút restart */}
                            <button
                                onClick={() => {
                                    if (window.confirm('Làm lại từ đầu?')) handleRestart();
                                }}
                                style={{
                                    padding: '8px', borderRadius: 10,
                                    border: '1px solid #e2e8f0', background: '#fff',
                                    color: '#64748b', fontSize: 12, cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 6
                                }}
                            >
                                <RotateCcw size={12} /> Làm lại từ đầu
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default DictationPractice;
