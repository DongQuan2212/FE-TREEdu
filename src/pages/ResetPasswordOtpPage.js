import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const API_BASE_URL = "http://localhost:3001";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

// ── Sub-components ─────────────────────────────────────────────────────────────

const OTPInput = ({ otp, onChange, onKeyDown, onPaste, inputRefs, disabled, hasError }) =>
    <div className="flex gap-3 justify-center mb-1" onPaste={onPaste}>
        {otp.map((digit, i) => (
            <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onChange(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                disabled={disabled}
                className={[
                    "w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-150",
                    "focus:border-lime-500 focus:ring-2 focus:ring-lime-200",
                    hasError ? "border-red-300 bg-red-50" :
                        digit ? "border-lime-400 bg-lime-50 text-lime-700" : "border-gray-200 bg-gray-50 text-gray-800",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                ].filter(Boolean).join(" ")}
            />
        ))}
    </div>;

const PasswordField = ({ label, value, onChange, show, onToggle, placeholder, error, success }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={[
                    "w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none focus:ring-4 transition-all",
                    error ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-300 focus:border-lime-500 focus:ring-lime-500/20",
                ].join(" ")}
            />
            <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon open={show} />
            </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {success && <p className="text-green-600 text-xs mt-1">✓ {success}</p>}
    </div>
);

const EyeIcon = ({ open }) => open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const SuccessView = ({ countdown, onLogin }) => (
    <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 style={{ animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Đặt lại thành công!</h2>
        <p className="text-gray-500 mb-6">Mật khẩu của bạn đã được cập nhật.</p>
        <div className="bg-lime-50 border border-lime-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-lime-800 text-sm">
                Chuyển đến trang đăng nhập trong{" "}
                <span className="font-bold text-lg text-lime-600">{countdown}</span> giây
            </p>
        </div>
        <button onClick={onLogin}
                className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            Đăng nhập ngay
        </button>
    </div>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

const maskEmail = (email) =>
    email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c);

const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Yếu", color: "bg-red-400" };
    if (score <= 3) return { level: 2, label: "Trung bình", color: "bg-yellow-400" };
    return { level: 3, label: "Mạnh", color: "bg-green-500" };
};

// ── Main component ─────────────────────────────────────────────────────────────

const ResetPasswordOtpPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent | error

    const inputRefs = useRef([]);

    useEffect(() => { inputRefs.current[0]?.focus(); }, []);

    // Countdown redirect after success
    useEffect(() => {
        if (!success) return;
        const t = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(t); navigate("/login"); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [success, navigate]);

    // Resend cooldown ticker
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setInterval(() => {
            setResendCooldown((p) => (p <= 1 ? (clearInterval(t), 0) : p - 1));
        }, 1000);
        return () => clearInterval(t);
    }, [resendCooldown]);

    // ── OTP input handlers ──────────────────────────────────────────────────────
    const focusNext = (i) => inputRefs.current[i + 1]?.focus();
    const focusPrev = (i) => inputRefs.current[i - 1]?.focus();

    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp]; next[index] = digit;
        setOtp(next); setErrorMsg("");
        if (digit) focusNext(index);
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (otp[index]) { const n = [...otp]; n[index] = ""; setOtp(n); }
            else focusPrev(index);
        } else if (e.key === "ArrowLeft") focusPrev(index);
        else if (e.key === "ArrowRight") focusNext(index);
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((ch, i) => { next[i] = ch; });
        setOtp(next); setErrorMsg("");
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
    };

    // ── Submit ──────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const code = otp.join("");

        // Frontend validation
        if (code.length < OTP_LENGTH) { setErrorMsg("Vui lòng nhập đủ 6 chữ số OTP."); return; }
        if (newPassword.length < 6) { setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự."); return; }
        if (newPassword !== confirmPassword) { setErrorMsg("Mật khẩu nhập lại không khớp."); return; }
        if (!email) { setErrorMsg("Không tìm thấy email. Vui lòng thử lại."); return; }

        setLoading(true); setErrorMsg("");
        try {
            await axios.post(
                `${API_BASE_URL}/api/auth/reset-password`,
                { email, otp: code, newPassword },
                { withCredentials: true }
            );
            setSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
            setErrorMsg(msg);

            // Reset OTP if used/invalid
            if (msg.includes("không hợp lệ") || msg.includes("đã được sử dụng")) {
                setOtp(Array(OTP_LENGTH).fill(""));
                setTimeout(() => inputRefs.current[0]?.focus(), 0);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP ──────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0 || !email) return;
        setResendStatus("sending");
        try {
            await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, null, {
                params: { email, type: "RESET_PASSWORD" },
                withCredentials: true,
            });
            setResendStatus("sent");
            setResendCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(""));
            setErrorMsg("");
            setTimeout(() => inputRefs.current[0]?.focus(), 0);
        } catch {
            setResendStatus("error");
        }
    };

    // ── Derived ─────────────────────────────────────────────────────────────────
    const strength = getStrength(newPassword);
    const otpHasError = errorMsg && (errorMsg.includes("OTP") || errorMsg.includes("mã"));
    const isExpiredError = errorMsg.includes("hết hạn");

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex flex-col">
            <Header />

            <button
                onClick={() => navigate("/forgot-password")}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white text-2xl hover:bg-white/40 transition-all hover:scale-110 shadow-lg"
                title="Quay lại"
            >
                ←
            </button>

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/30">

                        {success ? (
                            <SuccessView countdown={countdown} onLogin={() => navigate("/login")} />
                        ) : (
                            <>
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-100 rounded-full mb-4">
                                        <svg className="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h1>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Mã OTP đã được gửi đến{" "}
                                        <span className="font-semibold text-gray-700">{maskEmail(email) || "email của bạn"}</span>
                                    </p>
                                </div>

                                {/* Global error (non-OTP) */}
                                {errorMsg && !otpHasError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-red-600 text-sm">{errorMsg}</p>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    {/* OTP */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Mã OTP <span className="text-red-500">*</span>
                                        </label>
                                        <OTPInput
                                            otp={otp}
                                            onChange={handleOtpChange}
                                            onKeyDown={handleOtpKeyDown}
                                            onPaste={handlePaste}
                                            inputRefs={inputRefs}
                                            disabled={loading}
                                            hasError={otpHasError}
                                        />
                                        {/* OTP-specific error */}
                                        {otpHasError && (
                                            <p className="text-red-500 text-xs mt-2 text-center">{errorMsg}</p>
                                        )}
                                        {/* Resend */}
                                        <div className="flex items-center justify-between mt-3 text-sm">
                                            <span className="text-gray-400 text-xs">Mã có hiệu lực trong 5 phút</span>
                                            <div className="text-right">
                                                <button
                                                    onClick={handleResend}
                                                    disabled={resendCooldown > 0 || resendStatus === "sending"}
                                                    className="text-lime-600 hover:text-lime-700 font-semibold text-xs disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {resendStatus === "sending" ? "Đang gửi..." :
                                                        resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại mã"}
                                                </button>
                                                {resendStatus === "sent" && resendCooldown > 0 && (
                                                    <p className="text-green-600 text-xs">Mã mới đã được gửi!</p>
                                                )}
                                                {resendStatus === "error" && (
                                                    <p className="text-red-500 text-xs">Gửi lại thất bại.</p>
                                                )}
                                            </div>
                                        </div>
                                        {isExpiredError && (
                                            <div className="mt-2 text-center">
                                                <button onClick={handleResend} disabled={resendCooldown > 0}
                                                        className="text-lime-600 underline text-xs disabled:text-gray-400">
                                                    Yêu cầu mã mới
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100" />

                                    {/* New password */}
                                    <PasswordField
                                        label="Mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(""); }}
                                        show={showPassword}
                                        onToggle={() => setShowPassword((p) => !p)}
                                        placeholder="Ít nhất 6 ký tự"
                                    />
                                    {newPassword && (
                                        <div className="-mt-3">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3].map((lvl) => (
                                                    <div key={lvl}
                                                         className={`h-1 flex-1 rounded-full transition-all ${strength.level >= lvl ? strength.color : "bg-gray-200"}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs ${strength.level === 1 ? "text-red-500" : strength.level === 2 ? "text-yellow-600" : "text-green-600"}`}>
                                                {strength.label}
                                            </p>
                                        </div>
                                    )}

                                    {/* Confirm password */}
                                    <PasswordField
                                        label="Xác nhận mật khẩu"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
                                        show={showConfirm}
                                        onToggle={() => setShowConfirm((p) => !p)}
                                        placeholder="Nhập lại mật khẩu"
                                        error={confirmPassword && confirmPassword !== newPassword ? "Mật khẩu không khớp" : null}
                                        success={confirmPassword && confirmPassword === newPassword ? "Mật khẩu khớp" : null}
                                    />

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl
                                                   shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5
                                                   disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                                                   disabled:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : "Đặt lại mật khẩu"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <style>{`
                @keyframes popIn {
                    from { transform: scale(0); opacity: 0; }
                    to   { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ResetPasswordOtpPage;
