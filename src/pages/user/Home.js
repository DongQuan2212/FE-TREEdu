import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import iconQuiz from "../../asset/User/quiz.png";
import iconFlashcard from "../../asset/User/flash-cards.png";
import iconRoom from "../../asset/User/room.png";
import { missionAPI } from "../../config/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year, month) => new Date(year, month, 1).getDay();

const MONTH_NAMES = [
    "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
    "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];
const DOW = ["CN","T2","T3","T4","T5","T6","T7"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CalendarPanel({ checkedDays, onCheckin, todayChecked }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

    const changeMonth = (dir) => {
        let m = viewMonth + dir, y = viewYear;
        if (m > 11) { m = 0; y++; }
        if (m < 0) { m = 11; y--; }
        setViewMonth(m); setViewYear(y);
    };

    let streak = 0;
    for (let d = today.getDate(); d >= 1; d--) {
        const key = `${today.getFullYear()}-${today.getMonth()}-${d}`;
        if (checkedDays.has(key)) streak++;
        else break;
    }

    const checkedThisMonth = [...checkedDays].filter(k => k.startsWith(`${viewYear}-${viewMonth}-`)).length;

    return (
        <div className="tredu-panel">
            <div className="tredu-panel-header">
                <div className="tredu-panel-title">
                    <span className="tredu-title-icon">📅</span>
                    Lịch điểm danh
                </div>
                <div className="tredu-month-nav">
                    <button className="tredu-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                    <span className="tredu-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                    <button className="tredu-nav-btn" onClick={() => changeMonth(1)} disabled={isCurrentMonth}>›</button>
                </div>
            </div>

            <div className="tredu-cal-grid">
                {DOW.map(d => <div key={d} className="tredu-dow-label">{d}</div>)}

                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} className="tredu-cal-cell tredu-cal-empty" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const key = `${viewYear}-${viewMonth}-${day}`;
                    const isChecked = checkedDays.has(key);
                    const isToday = isCurrentMonth && day === today.getDate();
                    const isFuture = isCurrentMonth && day > today.getDate();
                    const isPast = isCurrentMonth && day < today.getDate();
                    const isNotCurrentMonth = !isCurrentMonth;

                    let cls = "tredu-cal-cell";
                    if (isChecked) cls += " tredu-checked";
                    else if (isToday) cls += " tredu-today";
                    else if (isFuture || isNotCurrentMonth) cls += " tredu-dim";
                    else if (isPast) cls += " tredu-missed";

                    const canCheckIn = isToday && !todayChecked;

                    return (
                        <button
                            key={day}
                            className={cls + (canCheckIn ? " tredu-can-checkin" : "")}
                            onClick={canCheckIn ? onCheckin : undefined}
                            disabled={!canCheckIn}
                        >
                            {isChecked ? <span className="tredu-check-mark">✓</span> : <span className="tredu-day-num">{day}</span>}
                        </button>
                    );
                })}
            </div>

            <div className="tredu-cal-footer">
                <div className="tredu-stat">
                    <span className="tredu-stat-icon">🔥</span>
                    <span className="tredu-stat-num">{streak}</span>
                    <span className="tredu-stat-label">ngày liên tiếp</span>
                </div>
                <div className="tredu-stat-divider" />
                <div className="tredu-stat">
                    <span className="tredu-stat-icon">✅</span>
                    <span className="tredu-stat-num">{checkedThisMonth}</span>
                    <span className="tredu-stat-label">/ {daysInMonth} ngày</span>
                </div>
            </div>
        </div>
    );
}

function MissionItem({ mission, onAction, loading }) {
    // 🚀 FIX: Dùng biến fallback để bắt trúng biến dù BE có trả về cắt mất chữ "is" hay không
    const isDone = mission.isCompleted || mission.completed;
    const isClaimed = mission.isRewardClaimed || mission.rewardClaimed;
    const { missionId, title, type, currentCount, targetCount, rewardXp } = mission;

    const pct = type === "CHECK_IN" ? (isDone ? 100 : 0) : Math.min((currentCount / targetCount) * 100, 100);

    let btnLabel = "", btnClass = "tredu-mission-btn";
    let btnDisabled = loading;

    if (type === "CHECK_IN") {
        if (isDone) {
            btnLabel = "Đã điểm danh ✓"; btnClass += " tredu-btn-claimed"; btnDisabled = true;
        } else {
            btnLabel = "Điểm danh"; btnClass += " tredu-btn-checkin";
        }
    } else if (isClaimed) {
        btnLabel = "Đã nhận ✓"; btnClass += " tredu-btn-claimed"; btnDisabled = true;
    } else if (isDone) {
        btnLabel = `Nhận +${rewardXp} XP`; btnClass += " tredu-btn-claim";
    } else {
        btnLabel = `${currentCount}/${targetCount}`; btnClass += " tredu-btn-progress"; btnDisabled = true;
    }

    return (
        <div className={`tredu-mission-item${isDone && !isClaimed ? " tredu-mission-ready" : ""}${isClaimed ? " tredu-mission-done" : ""}`}>
            <div className="tredu-mission-body">
                <div className="tredu-mission-top">
                    <span className="tredu-mission-title">{title}</span>
                    <span className="tredu-xp-badge">+{rewardXp} XP</span>
                </div>
                {type !== "CHECK_IN" && (
                    <div className="tredu-progress-track">
                        <div className="tredu-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                )}
                <div className="tredu-mission-bottom">
                    <span className="tredu-progress-label">
                        {type === "CHECK_IN"
                            ? (isDone ? "Đã điểm danh hôm nay ✓" : "Chưa điểm danh")
                            : `${currentCount} / ${targetCount}`}
                    </span>
                </div>
            </div>
            <button
                className={btnClass}
                disabled={btnDisabled}
                onClick={() => onAction(mission)}
            >
                {loading && !btnDisabled ? "..." : btnLabel}
            </button>
        </div>
    );
}

function MissionsPanel({ missions, onAction, loadingId, totalXp }) {
    return (
        <div className="tredu-panel">
            <div className="tredu-panel-header">
                <div className="tredu-panel-title">
                    <span className="tredu-title-icon">🎯</span>
                    Nhiệm vụ hôm nay
                </div>
                <span className="tredu-reset-badge">Reset lúc 00:00</span>
            </div>

            <div className="tredu-mission-list">
                {missions.map(m => (
                    <MissionItem
                        key={m.missionId}
                        mission={m}
                        onAction={onAction}
                        loading={loadingId === m.missionId}
                    />
                ))}
            </div>

            <div className="tredu-xp-footer">
                <span className="tredu-xp-footer-label">XP đã nhận hôm nay</span>
                <span className="tredu-xp-footer-value">{totalXp} XP</span>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function HomePage() {
    const navigate = useNavigate();

    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const checkedDays = new Set();

    // 🚀 FIX: Kiểm tra đồng thời cả 2 dạng tên biến
    const checkInMission = missions.find(m => m.type === "CHECK_IN");
    const isCheckInDone = checkInMission?.isCompleted || checkInMission?.completed;

    if (isCheckInDone) checkedDays.add(todayKey);

    const todayChecked = checkedDays.has(todayKey);
    const totalXp = missions.filter(m => m.isRewardClaimed || m.rewardClaimed).reduce((sum, m) => sum + m.rewardXp, 0);

    // ── Fetch ──
    const fetchMissions = useCallback(async () => {
        const userInfo = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (!userInfo) { setIsLoggedIn(false); setLoading(false); return; }

        try {
            setLoading(true);
            const res = await missionAPI.getDailyMissions();
            // 🚀 FIX: Đọc sâu mảng phòng trường hợp BE bọc data qua lớp Generic Response
            const fetchedMissions = res.data?.missions || res.data?.data?.missions || [];
            setMissions(fetchedMissions);
            setIsLoggedIn(true);
        } catch (err) {
            if (err.response?.status === 401) {
                setIsLoggedIn(false);
            } else {
                setError("Không thể tải nhiệm vụ. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMissions(); }, [fetchMissions]);

    // ── Actions ──
    const handleAction = async (mission) => {
        setLoadingId(mission.missionId);
        try {
            let res;
            const isDone = mission.isCompleted || mission.completed;
            const isClaimed = mission.isRewardClaimed || mission.rewardClaimed;

            if (mission.type === "CHECK_IN" && !isDone) {
                res = await missionAPI.checkIn();
            } else if (isDone && !isClaimed) {
                res = await missionAPI.claimReward(mission.missionId);
            }

            if (res) {
                const updatedMissions = res.data?.missions || res.data?.data?.missions || [];
                if (updatedMissions.length > 0) {
                    setMissions(updatedMissions);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoadingId(null);
        }
    };

    const handleCheckin = () => {
        const checkIn = missions.find(m => m.type === "CHECK_IN");
        const isDone = checkIn?.isCompleted || checkIn?.completed;
        if (checkIn && !isDone) handleAction(checkIn);
    };

    return (
        <>
            <style>{`
                /* CSS giữ nguyên 100% của ông, không sửa gì cả */
                .tredu-section { padding: 96px 24px 48px; background: #f7f8fa; }
                .tredu-container { max-width: 960px; margin: 0 auto; }
                .tredu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 720px) { .tredu-grid { grid-template-columns: 1fr; } }
                .tredu-panel { background: #fff; border-radius: 16px; border: 1px solid #e8eaf0; padding: 20px; display: flex; flex-direction: column; gap: 0; }
                .tredu-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
                .tredu-panel-title { font-size: 15px; font-weight: 600; color: #1a1d23; display: flex; align-items: center; gap: 7px; }
                .tredu-title-icon { font-size: 16px; }
                .tredu-month-nav { display: flex; align-items: center; gap: 8px; }
                .tredu-month-label { font-size: 13px; font-weight: 500; color: #444; min-width: 90px; text-align: center; }
                .tredu-nav-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #e0e2e8; background: #fff; cursor: pointer; font-size: 16px; color: #666; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
                .tredu-nav-btn:hover:not(:disabled) { background: #f3f4f8; }
                .tredu-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
                .tredu-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
                .tredu-dow-label { text-align: center; font-size: 10px; font-weight: 600; color: #aab; padding: 0 0 6px; letter-spacing: 0.03em; }
                .tredu-cal-cell { aspect-ratio: 1; border-radius: 7px; border: 1px solid #eceef3; background: #fafbfc; display: flex; align-items: center; justify-content: center; cursor: default; transition: all 0.15s; position: relative; outline: none; }
                .tredu-day-num { font-size: 11px; color: #888; }
                .tredu-cal-empty { border-color: transparent; background: transparent; }
                .tredu-today { border-color: #3b82f6; background: #eff6ff; }
                .tredu-today .tredu-day-num { color: #2563eb; font-weight: 700; }
                .tredu-can-checkin { cursor: pointer; border-color: #3b82f6; background: #dbeafe; animation: tredu-pulse 2s infinite; }
                .tredu-can-checkin:hover { background: #bfdbfe !important; }
                @keyframes tredu-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); } 50% { box-shadow: 0 0 0 4px rgba(59,130,246,0.1); } }
                .tredu-checked { background: #dcfce7; border-color: #86efac; cursor: default; }
                .tredu-check-mark { font-size: 13px; color: #16a34a; font-weight: 700; }
                .tredu-missed { opacity: 0.45; }
                .tredu-dim { opacity: 0.3; }
                .tredu-cal-footer { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f1f5; }
                .tredu-stat { display: flex; align-items: center; gap: 5px; }
                .tredu-stat-icon { font-size: 15px; }
                .tredu-stat-num { font-size: 18px; font-weight: 700; color: #1a1d23; }
                .tredu-stat-label { font-size: 12px; color: #888; }
                .tredu-stat-divider { width: 1px; height: 28px; background: #e8eaf0; margin: 0 4px; }
                .tredu-reset-badge { font-size: 11px; font-weight: 500; color: #6b7280; background: #f3f4f6; border-radius: 20px; padding: 3px 10px; }
                .tredu-mission-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .tredu-mission-item { border: 1px solid #e8eaf0; border-radius: 10px; padding: 12px 12px 12px 14px; display: flex; align-items: center; gap: 12px; transition: border-color 0.15s, background 0.15s; }
                .tredu-mission-ready { border-color: #fcd34d; background: #fffbeb; }
                .tredu-mission-done { opacity: 0.6; }
                .tredu-mission-body { flex: 1; min-width: 0; }
                .tredu-mission-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
                .tredu-mission-title { font-size: 13px; font-weight: 500; color: #1a1d23; line-height: 1.4; }
                .tredu-xp-badge { font-size: 11px; font-weight: 600; color: #b45309; background: #fef3c7; border-radius: 4px; padding: 2px 7px; white-space: nowrap; flex-shrink: 0; }
                .tredu-progress-track { height: 3px; background: #e8eaf0; border-radius: 2px; overflow: hidden; margin-bottom: 5px; }
                .tredu-progress-fill { height: 100%; background: #22c55e; border-radius: 2px; transition: width 0.5s cubic-bezier(.4,0,.2,1); }
                .tredu-progress-label { font-size: 11px; color: #9ca3af; }
                .tredu-mission-btn { flex-shrink: 0; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; border: none; cursor: pointer; transition: all 0.15s; white-space: nowrap; min-width: 90px; text-align: center; }
                .tredu-btn-checkin { background: #2563eb; color: #fff; }
                .tredu-btn-checkin:hover:not(:disabled) { background: #1d4ed8; }
                .tredu-btn-claim { background: #f59e0b; color: #fff; animation: tredu-glow 1.5s ease-in-out infinite alternate; }
                @keyframes tredu-glow { from { box-shadow: 0 0 4px rgba(245,158,11,0.3); } to { box-shadow: 0 0 10px rgba(245,158,11,0.6); } }
                .tredu-btn-claim:hover:not(:disabled) { background: #d97706; }
                .tredu-btn-progress { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
                .tredu-btn-claimed { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
                .tredu-mission-btn:disabled { cursor: not-allowed; }
                .tredu-xp-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f1f5; }
                .tredu-xp-footer-label { font-size: 12px; color: #9ca3af; }
                .tredu-xp-footer-value { font-size: 16px; font-weight: 700; color: #1a1d23; }
                .tredu-login-prompt { text-align: center; padding: 32px 16px; grid-column: 1 / -1; background: #fff; border-radius: 16px; border: 1px solid #e8eaf0; }
                .tredu-login-prompt p { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
                .tredu-login-btn { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: none; border-radius: 24px; padding: 10px 28px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
                .tredu-login-btn:hover { opacity: 0.9; }
                .tredu-skeleton { background: linear-gradient(90deg, #f0f1f5 25%, #e8eaf0 50%, #f0f1f5 75%); background-size: 200% 100%; animation: tredu-shimmer 1.4s infinite; border-radius: 8px; }
                @keyframes tredu-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                .tredu-skeleton-panel { background: #fff; border-radius: 16px; border: 1px solid #e8eaf0; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
                .tredu-error { grid-column: 1 / -1; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px 20px; color: #be123c; font-size: 13px; display: flex; align-items: center; justify-content: space-between; }
                .tredu-retry-btn { font-size: 12px; font-weight: 600; color: #be123c; background: none; border: 1px solid #fecdd3; border-radius: 6px; padding: 5px 12px; cursor: pointer; }
            `}</style>

            <Header />

            <section className="tredu-section">
                <div className="tredu-container">
                    <div className="tredu-grid">
                        {!isLoggedIn && !loading && (
                            <div className="tredu-login-prompt">
                                <p>Đăng nhập để điểm danh, nhận XP và hoàn thành nhiệm vụ hàng ngày!</p>
                                <button className="tredu-login-btn" onClick={() => navigate("/login")}>Đăng nhập ngay →</button>
                            </div>
                        )}

                        {error && isLoggedIn && (
                            <div className="tredu-error">
                                <span>{error}</span>
                                <button className="tredu-retry-btn" onClick={fetchMissions}>Thử lại</button>
                            </div>
                        )}

                        {loading && (
                            <>
                                <div className="tredu-skeleton-panel">
                                    <div className="tredu-skeleton" style={{ height: 18, width: "50%" }} />
                                    <div className="tredu-skeleton" style={{ height: 200 }} />
                                    <div className="tredu-skeleton" style={{ height: 36 }} />
                                </div>
                                <div className="tredu-skeleton-panel">
                                    <div className="tredu-skeleton" style={{ height: 18, width: "50%" }} />
                                    {[1,2,3,4].map(i => <div key={i} className="tredu-skeleton" style={{ height: 64 }} />)}
                                </div>
                            </>
                        )}

                        {!loading && isLoggedIn && !error && (
                            <>
                                <CalendarPanel checkedDays={checkedDays} onCheckin={handleCheckin} todayChecked={todayChecked} />
                                <MissionsPanel missions={missions} onAction={handleAction} loadingId={loadingId} totalXp={totalXp} />
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Các section cũ của ông */}
            <section className="py-20 bg-gray-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 data-aos="fade-up" className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">Bạn sẽ học được gì trên TREEdu?</h2>
                    <p data-aos="fade-up" data-aos-delay="200" className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">Luyện học Tiếng Việt chưa bao giờ dễ đến vậy</p>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div data-aos="zoom-in" data-aos-delay="100" className="bg-white rounded-2xl shadow-2xl p-10 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <img src={iconQuiz} alt="Quiz" className="w-12 h-12 filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Các bài quiz đa dạng</h3>
                            <p className="text-gray-600 mb-6">Ôn luyện Tiếng Việt hiệu quả: đề luyện phong phú, chấm tự động và lời giải rõ ràng.</p>
                            <button onClick={() => navigate("/quiz")} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition">Làm ngay →</button>
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="300" className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <img src={iconFlashcard} alt="Flashcard" className="w-12 h-12 filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Flashcard Thông Minh</h3>
                            <p className="text-gray-600 mb-6">Ghi nhớ từ vựng nhanh hơn với flashcard thông minh – lặp lại theo chu kỳ và theo dõi tiến độ học.</p>
                            <button onClick={() => navigate("/flashcard")} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition">Tạo bộ từ →</button>
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="500" className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <img src={iconRoom} alt="Phòng phát âm" className="w-12 h-12 filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Chấm Phát Âm</h3>
                            <p className="text-gray-600 mb-6">Luyện nói chuẩn như người bản xứ • nhận điểm & góp ý tức thì</p>
                            <button onClick={() => navigate("/pronunciation-practice")} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition">Luyện nói →</button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

export default HomePage;
