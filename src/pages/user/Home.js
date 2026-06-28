import React, { useState, useEffect } from "react";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import iconQuiz from "../../asset/User/quiz.png";
import iconFlashcard from "../../asset/User/flash-cards.png";
import iconRoom from "../../asset/User/room.png";
import avatar1 from "../../asset/User1.jpg";
import avatar2 from "../../asset/User2.jpg";
import avatar3 from "../../asset/user3.webp";

import { useNavigate } from "react-router-dom";
import { Headphones, Flame, Trophy, Zap } from "lucide-react";
import { leaderboardAPI } from "../../config/api";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const getInitials = (name) => {
    if (!name) return "V";
    const words = name.trim().split(" ").filter((w) => w.length > 0);
    if (words.length === 0) return "V";
    return words.slice(-2).map((w) => w[0]).join("").toUpperCase();
};

const AVATAR_COLORS = [
    ["#dbeafe", "#1e40af"],
    ["#dcfce7", "#166534"],
    ["#fce7f3", "#9d174d"],
    ["#ede9fe", "#5b21b6"],
    ["#ffedd5", "#9a3412"],
    ["#f0fdf4", "#14532d"],
];

const formatValue = (val, isStreak) =>
    !isStreak && val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;

/* hash userId → index màu avatar ổn định theo từng người */
const hashUserId = (userId = "") => {
    let h = 0;
    for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
    return h % AVATAR_COLORS.length;
};

/* ─── keyframes ─────────────────────────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes podium-rise {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
}
@keyframes crown-float {
    0%, 100% { transform: translateX(-50%) translateY(0);   }
    50%       { transform: translateX(-50%) translateY(-5px); }
}
@keyframes lb-row-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
}
`;

/* ─── PodiumCard ─────────────────────────────────────────────────────────────── */
function PodiumCard({ entry, isStreak, animDelay }) {
    const rank = entry.rank;
    const [avatarBg, avatarColor] = AVATAR_COLORS[hashUserId(entry.userId)];
    const isTop1 = rank === 1;
    const unit = isStreak ? "ngày" : "XP";
    const valColor = isStreak ? "#d97706" : "#2563eb";
    const iconColor = isStreak ? "#d97706" : "#2563eb";

    /* podium block heights */
    const blockH = isTop1 ? "h-[90px]" : rank === 2 ? "h-[64px]" : "h-[46px]";

    /* card accent */
    const blockBg =
        rank === 1
            ? "bg-amber-50 border-amber-200"
            : rank === 2
                ? "bg-gray-50 border-gray-200"
                : "bg-orange-50 border-orange-200";

    /* avatar size */
    const avatarSize = isTop1
        ? "w-[68px] h-[68px] text-lg"
        : "w-[54px] h-[54px] text-[15px]";

    /* rank number color on block */
    const rankNumColor =
        rank === 1 ? "text-amber-500" : rank === 2 ? "text-slate-400" : "text-orange-400";

    return (
        <div
            className="flex flex-col items-center"
            style={{
                animation: `podium-rise 0.45s ease ${animDelay}ms both`,
                width: isTop1 ? 160 : 140,
            }}
        >
            {/* avatar + badge */}
            <div className="relative mb-2">
                <div
                    className={`rounded-full flex items-center justify-center font-semibold border-2 border-white overflow-hidden ${avatarSize}`}
                    style={{ background: avatarBg, color: avatarColor, boxShadow: "0 0 0 1.5px #e5e7eb" }}
                >
                    {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.displayName} className="w-full h-full object-cover" />
                    ) : (
                        getInitials(entry.displayName)
                    )}
                </div>

                {rank === 1 && (
                    <span
                        style={{
                            position: "absolute",
                            top: -22,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 22,
                            animation: "crown-float 2.6s ease-in-out infinite",
                            lineHeight: 1,
                        }}
                        aria-label="Hạng nhất"
                    >
                        👑
                    </span>
                )}

                {rank !== 1 && (
                    <span
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-white ${
                            rank === 2 ? "bg-slate-200 text-slate-600" : "bg-orange-200 text-orange-700"
                        }`}
                    >
                        {rank}
                    </span>
                )}
            </div>

            {/* name */}
            <p
                className="font-semibold text-gray-900 text-center mb-0.5 leading-tight"
                style={{ fontSize: isTop1 ? 13 : 12, maxWidth: isTop1 ? 148 : 128, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
                {entry.displayName || "Ẩn danh"}
            </p>

            {entry.isMe && (
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold leading-none mb-0.5">
                    Bạn
                </span>
            )}

            <p className="text-[11px] text-gray-400 mb-1.5">Cấp {entry.level || 1}</p>

            {/* value */}
            <div className="flex items-center gap-1 mb-2">
                {isStreak ? (
                    <Flame size={12} style={{ color: iconColor }} fill={iconColor} strokeWidth={1.5} />
                ) : (
                    <Zap size={12} style={{ color: iconColor }} fill={iconColor} strokeWidth={1.5} />
                )}
                <span className="text-sm font-bold tabular-nums" style={{ color: valColor }}>
                    {formatValue(entry.value, isStreak)}
                </span>
                <span className="text-[11px] text-gray-400">{unit}</span>
            </div>

            {/* podium block */}
            <div className={`w-full rounded-t-xl border ${blockH} ${blockBg} flex items-start justify-center pt-2.5`}>
                <span className={`text-xl font-bold ${rankNumColor}`}>
                    {rank === 1 ? "1" : ""}
                </span>
            </div>
        </div>
    );
}

/* ─── LeaderboardSection ─────────────────────────────────────────────────────── */
function LeaderboardSection() {
    const [activeTab, setActiveTab] = useState("streak");
    const [streakData, setStreakData] = useState({ entries: [], myRank: null });
    const [xpData, setXpData] = useState({ entries: [], myRank: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [s, x] = await Promise.all([
                    leaderboardAPI.getStreak(),
                    leaderboardAPI.getTotalXp(),
                ]);

                // Bọc an toàn để lấy data chuẩn xác (phòng hờ unwrap interceptor)
                const streakDataRaw = s?.data || s;
                const xpDataRaw = x?.data || x;

                setStreakData({ entries: streakDataRaw?.entries || [], myRank: streakDataRaw?.myRank ?? null });
                setXpData({ entries: xpDataRaw?.entries || [], myRank: xpDataRaw?.myRank ?? null });
            } catch (e) {
                console.error("Lỗi fetch leaderboard:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const current = activeTab === "streak" ? streakData : xpData;
    const isStreak = activeTab === "streak";

    const top3    = current.entries.filter((e) => e.rank <= 3);
    const restList = current.entries.filter((e) => e.rank > 3);

    /* sắp xếp podium: top2 trái | top1 giữa | top3 phải */
    const podiumOrder = [
        top3.find((e) => e.rank === 2),
        top3.find((e) => e.rank === 1),
        top3.find((e) => e.rank === 3),
    ].filter(Boolean);

    /* animation delay: top2=60ms, top1=0ms, top3=120ms */
    const podiumDelays = { 2: 60, 1: 0, 3: 120 };

    return (
        <section className="py-20 bg-white border-t border-gray-100">
            <style>{KEYFRAMES}</style>
            <div className="max-w-2xl mx-auto px-6">

                {/* Heading */}
                <div className="text-center mb-8" data-aos="fade-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        Bảng xếp hạng
                    </h2>
                    <p className="text-sm text-gray-400">Cạnh tranh cùng học viên toàn hệ thống</p>
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6"
                    data-aos="fade-up"
                    data-aos-delay="60"
                >
                    {[
                        { key: "streak", label: "Streak dài nhất", Icon: Flame,  activeColor: "text-orange-500" },
                        { key: "xp",     label: "Tổng điểm XP",   Icon: Zap,    activeColor: "text-blue-500"   },
                    ].map(({ key, label, Icon, activeColor }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200 ${
                                activeTab === key
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            <Icon
                                size={13}
                                strokeWidth={2}
                                className={activeTab === key ? activeColor : "text-current"}
                            />
                            {label}
                        </button>
                    ))}
                </div>

                {/* My rank badge */}
                {current.myRank && (
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-500 font-medium">
                            <Trophy size={11} className="text-emerald-500" />
                            Vị trí của bạn:{" "}
                            <strong className="text-gray-800 ml-0.5">#{current.myRank}</strong>
                        </span>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {/* podium skeleton */}
                        <div className="flex items-end justify-center gap-3 mb-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[54px] h-[54px] rounded-full bg-gray-100 animate-pulse" />
                                <div className="w-[140px] h-[64px] rounded-t-xl bg-gray-100 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[68px] h-[68px] rounded-full bg-gray-100 animate-pulse" />
                                <div className="w-[160px] h-[90px] rounded-t-xl bg-gray-100 animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-[54px] h-[54px] rounded-full bg-gray-100 animate-pulse" />
                                <div className="w-[140px] h-[46px] rounded-t-xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                        {[1, 2].map((n) => (
                            <div key={n} className="h-[52px] rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : current.entries.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-gray-300">
                        <Trophy size={32} className="mb-3 opacity-30" />
                        <p className="text-sm">Chưa có dữ liệu</p>
                    </div>
                ) : (
                    <div key={activeTab}>
                        {/* ── Podium top 3 ── */}
                        {podiumOrder.length > 0 && (
                            <div className="flex items-end justify-center gap-2 mb-6 pt-8">
                                {podiumOrder.map((entry, i) => (
                                    <PodiumCard
                                        key={`${entry.userId}-${entry.rank}`}
                                        entry={entry}
                                        isStreak={isStreak}
                                        animDelay={podiumDelays[entry.rank] ?? 0}
                                    />
                                ))}
                            </div>
                        )}

                        {/* ── Rest rows (hạng 4+) ── */}
                        {restList.length > 0 && (
                            <div className="flex flex-col gap-1.5 mt-2">
                                {restList.map((entry, i) => {
                                    const [avatarBg, avatarText] = AVATAR_COLORS[hashUserId(entry.userId)];
                                    const isMe = current.myRank === entry.rank;
                                    const unit = isStreak ? "ngày" : "XP";

                                    return (
                                        <div
                                            key={`${entry.userId}-${entry.rank}`}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white transition-all duration-150 hover:-translate-y-[1px] hover:border-gray-200 ${
                                                isMe ? "border-2 border-emerald-300" : "border border-gray-100"
                                            }`}
                                            style={{
                                                animation: "lb-row-in 0.35s ease both",
                                                animationDelay: `${i * 60}ms`,
                                            }}
                                        >
                                            {/* rank */}
                                            <div className="w-6 text-center shrink-0">
                                                <span className="text-[13px] font-semibold text-gray-300 tabular-nums">
                                                    {entry.rank}
                                                </span>
                                            </div>

                                            {/* avatar */}
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border border-black/5 shrink-0 select-none overflow-hidden"
                                                style={{ background: avatarBg, color: avatarText }}
                                            >
                                                {entry.avatarUrl ? (
                                                    <img src={entry.avatarUrl} alt={entry.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    getInitials(entry.displayName)
                                                )}
                                            </div>

                                            {/* info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[13px] font-semibold text-gray-900 truncate">
                                                        {entry.displayName || "Học viên ẩn danh"}
                                                    </span>
                                                    {isMe && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold shrink-0 leading-none">
                                                            Bạn
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-gray-400">Cấp {entry.level || 1}</span>
                                            </div>

                                            {/* value */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {isStreak ? (
                                                    <Flame size={13} className="text-gray-300" strokeWidth={1.5} />
                                                ) : (
                                                    <Zap size={13} className="text-gray-300" strokeWidth={1.5} />
                                                )}
                                                <span className="text-sm font-bold tabular-nums text-gray-600">
                                                    {formatValue(entry.value, isStreak)}
                                                </span>
                                                <span className="text-[11px] text-gray-400">{unit}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── HomePage ───────────────────────────────────────────────────────────────── */
function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            <Header />

            <section className="py-20 bg-gray-50 mt-14">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 data-aos="fade-up" className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                        Bạn sẽ học được gì trên TREEdu?
                    </h2>
                    <p data-aos="fade-up" data-aos-delay="200" className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
                        Luyện học Tiếng Việt chưa bao giờ dễ đến vậy
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Quiz Card */}
                        <div data-aos="zoom-in" data-aos-delay="100" className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <img src={iconQuiz} alt="Quiz" className="w-12 h-12 filter brightness-0 invert" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Các bài quiz đa dạng</h3>
                                <p className="text-gray-600 text-sm mb-6">Ôn luyện Tiếng Việt hiệu quả: đề luyện phong phú, chấm tự động và lời giải rõ ràng.</p>
                            </div>
                            <button onClick={() => navigate("/quiz")} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition mt-auto">Làm ngay →</button>
                        </div>

                        {/* Flashcard Card */}
                        <div data-aos="zoom-in" data-aos-delay="200" className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <img src={iconFlashcard} alt="Flashcard" className="w-12 h-12 filter brightness-0 invert" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Flashcard Thông Minh</h3>
                                <p className="text-gray-600 text-sm mb-6">Ghi nhớ từ vựng nhanh hơn với flashcard thông minh – lặp lại theo chu kỳ và theo dõi tiến độ.</p>
                            </div>
                            <button onClick={() => navigate("/flashcard")} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition mt-auto">Tạo bộ từ →</button>
                        </div>

                        {/* Pronunciation Card */}
                        <div data-aos="zoom-in" data-aos-delay="300" className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                    <img src={iconRoom} alt="Phát âm" className="w-12 h-12 filter brightness-0 invert" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">AI Chấm Phát Âm</h3>
                                <p className="text-gray-600 text-sm mb-6">Luyện nói chuẩn như người bản xứ, nhận phản hồi chấm điểm và sửa lỗi phát âm tức thì.</p>
                            </div>
                            <button onClick={() => navigate("/pronunciation-practice")} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition mt-auto">Luyện nói →</button>
                        </div>

                        {/* Dictation Card */}
                        <div data-aos="zoom-in" data-aos-delay="400" className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between border-2 border-orange-100">
                            <div>
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-md shadow-orange-200">
                                    <Headphones size={40} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Nghe Chính Tả</h3>
                                <p className="text-gray-600 text-sm mb-6">Tăng phản xạ Nghe - Viết cực hạn. AI tự bóc băng tiếng Việt từng câu, so khớp và sửa lỗi chi tiết.</p>
                            </div>
                            <button onClick={() => navigate("/dictation")} className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition mt-auto">Luyện nghe →</button>
                        </div>
                    </div>
                </div>
            </section>

            <LeaderboardSection />

            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 data-aos="fade-up" className="text-4xl md:text-5xl font-bold mb-16">Học viên nói gì về TREEdu?</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { img: avatar1, name: "Nguyễn Lan Anh", text: "Từ 5.5 lên 7.0 IELTS chỉ sau 2 tháng nhờ AI phát âm!", rating: "★★★★★" },
                            { img: avatar2, name: "Trần Minh Quân", text: "Flashcard giúp mình nhớ 1000 từ trong 3 tuần. Quá ngon!", rating: "★★★★★" },
                            { img: avatar3, name: "Phạm Thu Hà", text: "Đề thi giống đề thật đến 95%. Đạt 9.0 môn Anh THPT QG!", rating: "★★★★★" },
                        ].map((item, i) => (
                            <div key={i} data-aos="fade-up" data-aos-delay={i * 200} className="bg-white rounded-2xl p-8 shadow-lg">
                                <img src={item.img} alt={item.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                                <p className="text-3xl text-yellow-500 mb-2">{item.rating}</p>
                                <p className="text-gray-700 italic mb-4">"{item.text}"</p>
                                <p className="font-bold text-gray-800">- {item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

export default HomePage;
