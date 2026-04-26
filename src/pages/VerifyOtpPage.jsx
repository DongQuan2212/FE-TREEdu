import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const API_BASE_URL = "http://localhost:3001";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // giây

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // URL params: /verify-otp?email=user@example.com&type=SIGNUP
    const email = searchParams.get("email") || "";
    const type = searchParams.get("type") || "SIGNUP"; // SIGNUP | RESET_PASSWORD

    // OTP state
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [otpStatus, setOtpStatus] = useState("idle"); // idle | loading | error
    const [errorMsg, setErrorMsg] = useState("");
    const [countdown, setCountdown] = useState(5);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState("idle");

    // Password state (for RESET_PASSWORD)
    const [step, setStep] = useState("otp"); // otp | password | success
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState("idle");
    const [verifiedOtp, setVerifiedOtp] = useState("");

    const inputRefs = useRef([]);
    const passwordRef = useRef(null);

    // ─── Auto-focus ─────────────────────────────────────────────────────────────
    useEffect(() => { inputRefs.current[0]?.focus(); }, []);
    useEffect(() => { if (step === "password") passwordRef.current?.focus(); }, [step]);

    // ─── Countdown redirect sau success ──────────────────────────────────────────
    useEffect(() => {
        if (step !== "success") return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); navigate("/login"); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [step, navigate]);

    // ─── Resend cooldown ────────────────────────────────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setInterval(() => {
            setResendCooldown((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
        }, 1000);
        return () => clearInterval(t);
    }, [resendCooldown]);

    // ─── OTP input helpers ──────────────────────────────────────────────────────
    const focusNext = (i) => inputRefs.current[i + 1]?.focus();
    const focusPrev = (i) => inputRefs.current[i - 1]?.focus();

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        setErrorMsg("");
        if (digit) focusNext(index);
    };

    const handleKeyDown = (index, e) => {
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
        const next = [...otp];
        pasted.split("").forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        setErrorMsg("");
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
    };

    // ─── Verify OTP ─────────────────────────────────────────────────────────────
const handleVerifyOtp = useCallback(async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setErrorMsg("Vui lòng nhập đủ 6 chữ số."); return; }
    if (!email) { setErrorMsg("Không tìm thấy email. Vui lòng thử lại."); return; }

    // ── RESET_PASSWORD: KHÔNG gọi API ở bước này ─────────────────────────────
    // /verify-otp sẽ tiêu thụ OTP → /reset-password sau đó sẽ NOT_FOUND
    // OTP chỉ được verify+consume 1 lần duy nhất tại /reset-password
    if (type === "RESET_PASSWORD") {
        setVerifiedOtp(code);
        setStep("password");
        return;
    }

    // ── SIGNUP: gọi /verify-otp để kích hoạt tài khoản ───────────────────────
    setOtpStatus("loading");
    setErrorMsg("");
    try {
        await axios.post(
            `${API_BASE_URL}/api/auth/verify-otp`,
            { email, otp: code },
            { withCredentials: true }
        );
        setVerifiedOtp(code);
        setOtpStatus("idle");
        setStep("success");
    } catch (err) {
        setOtpStatus("error");
        const msg = err.response?.data?.message;
        if (msg) setErrorMsg(msg);
        else if (err.response?.status === 400) setErrorMsg("Mã OTP không chính xác hoặc đã hết hạn.");
        else setErrorMsg("Xác thực thất bại. Vui lòng thử lại.");
        setOtp(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
    }
}, [otp, email, type]);

    // Auto-submit khi điền đủ 6 số
    useEffect(() => {
        if (otp.every((d) => d !== "") && otpStatus === "idle" && step === "otp") {
            handleVerifyOtp();
        }
    }, [otp, handleVerifyOtp, otpStatus, step]);

    // ─── Resend OTP ────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0 || !email) return;
        setResendStatus("sending");
        try {
            await axios.post(
                `${API_BASE_URL}/api/auth/resend-otp`,
                null,
                { params: { email, type }, withCredentials: true }
            );
            setResendStatus("sent");
            setResendCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(""));
            setOtpStatus("idle");
            setErrorMsg("");
            setTimeout(() => inputRefs.current[0]?.focus(), 0);
        } catch {
            setResendStatus("error");
        }
    };

    // ─── Reset Password ────────────────────────────────────────────────────────
    const handleResetPassword = async () => {
        setErrorMsg("");

        if (newPassword.length < 6) {
            setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự."); return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg("Mật khẩu nhập lại không khớp."); return;
        }

        setPasswordStatus("loading");
        try {
            await axios.post(
                `${API_BASE_URL}/api/auth/reset-password`,
                { email, otp: verifiedOtp, newPassword },
                { withCredentials: true }
            );
            setPasswordStatus("success");
            setStep("success");
        } catch (err) {
            setPasswordStatus("error");
            const msg = err.response?.data?.message;
            if (msg) setErrorMsg(msg);
            else if (err.response?.status === 400) setErrorMsg("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            else setErrorMsg("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");

            if (err.response?.status === 400) {
                setTimeout(() => {
                    setStep("otp");
                    setOtp(Array(OTP_LENGTH).fill(""));
                    setVerifiedOtp("");
                    setOtpStatus("idle");
                    setPasswordStatus("idle");
                    setTimeout(() => inputRefs.current[0]?.focus(), 50);
                }, 2000);
            }
        }
    };

    // ─── Password strength ────────────────────────────────────────────────────
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
    const strength = getStrength(newPassword);

    // ─── Masked email ────────────────────────────────────────────────────────
    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c)
        : "email của bạn";

    // ─── Step indicator ──────────────────────────────────────────────────────
    const StepIndicator = () => type !== "RESET_PASSWORD" ? null : (
        <div className="flex items-center justify-center gap-3 mb-8">
            {["otp", "password"].map((s, i) => {
                const isActive = step === s;
                const isDone = (s === "otp" && (step === "password" || step === "success"));
                return (
                    <div key={s} className="flex items-center gap-3">
                        <div className={[
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                            isDone ? "bg-lime-500 text-white" :
                            isActive ? "bg-lime-100 border-2 border-lime-500 text-lime-600" :
                            "bg-gray-100 border-2 border-gray-200 text-gray-400"
                        ].join(" ")}>
                            {isDone ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : i + 1}
                        </div>
                        <span className={`text-xs font-medium ${isActive ? "text-gray-700" : "text-gray-400"}`}>
                            {s === "otp" ? "Nhập mã OTP" : "Mật khẩu mới"}
                        </span>
                        {i < 1 && <div className={`w-8 h-0.5 ${isDone ? "bg-lime-400" : "bg-gray-200"}`} />}
                    </div>
                );
            })}
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/30">

                        {/* SUCCESS STATE */}
                        {step === "success" ? (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        style={{ animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                    {type === "RESET_PASSWORD" ? "Đặt lại thành công!" : "Xác thực thành công!"}
                                </h2>
                                <p className="text-gray-500 mb-6">
                                    {type === "RESET_PASSWORD" ? "Mật khẩu của bạn đã được cập nhật." : "Tài khoản của bạn đã được kích hoạt."}
                                </p>
                                <div className="bg-lime-50 border border-lime-200 rounded-xl px-5 py-4 mb-6">
                                    <p className="text-lime-800 text-sm">
                                        Chuyển đến trang đăng nhập trong{" "}
                                        <span className="font-bold text-lg text-lime-600">{countdown}</span> giây
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    Đăng nhập ngay
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-100 rounded-full mb-4">
                                        <svg className="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {type === "RESET_PASSWORD" ? "Đặt lại mật khẩu" : "Xác thực email"}
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {step === "otp" 
                                            ? <>Nhập mã 6 chữ số đã được gửi đến <span className="font-semibold text-gray-700">{maskedEmail}</span></>
                                            : "Tạo mật khẩu mới cho tài khoản của bạn"
                                        }
                                    </p>
                                </div>

                                <StepIndicator />

                                {/* Error message */}
                                {errorMsg && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-red-600 text-sm">{errorMsg}</p>
                                    </div>
                                )}

                                {/* STEP 1: OTP INPUT */}
                                {step === "otp" && (
                                    <>
                                        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => (inputRefs.current[i] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                                    disabled={otpStatus === "loading"}
                                                    className={[
                                                        "w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none",
                                                        "transition-all duration-150 select-none",
                                                        "focus:border-lime-500 focus:ring-2 focus:ring-lime-200",
                                                        digit ? "border-lime-400 bg-lime-50 text-lime-700"
                                                              : "border-gray-200 bg-gray-50 text-gray-800",
                                                        otpStatus === "error" && !digit ? "border-red-300 bg-red-50" : "",
                                                        otpStatus === "loading" ? "opacity-50 cursor-not-allowed" : "",
                                                    ].filter(Boolean).join(" ")}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={otpStatus === "loading" || otp.some((d) => !d)}
                                            className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl
                                                       shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5
                                                       disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                                                       disabled:translate-y-0 flex items-center justify-center gap-2 mb-5"
                                        >
                                            {otpStatus === "loading" ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Đang kiểm tra...
                                                </>
                                            ) : "Tiếp theo"}
                                        </button>

                                        {/* Resend */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-gray-400 text-xs">hoặc</span>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-500 text-sm mb-1">Không nhận được mã?</p>
                                            <button
                                                onClick={handleResend}
                                                disabled={resendCooldown > 0 || resendStatus === "sending"}
                                                className="text-lime-600 hover:text-lime-700 font-semibold text-sm
                                                           disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {resendStatus === "sending" ? "Đang gửi..." :
                                                 resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại mã"}
                                            </button>
                                            {resendStatus === "sent" && resendCooldown > 0 && (
                                                <p className="text-green-600 text-xs mt-1">Mã mới đã được gửi!</p>
                                            )}
                                            {resendStatus === "error" && (
                                                <p className="text-red-500 text-xs mt-1">Gửi lại thất bại. Vui lòng thử lại.</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* STEP 2: PASSWORD (RESET_PASSWORD only) */}
                                {step === "password" && (
                                    <div className="space-y-4">
                                        {/* New password */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Mật khẩu mới <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    ref={passwordRef}
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(""); }}
                                                    placeholder="Ít nhất 6 ký tự"
                                                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-300
                                                               focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20
                                                               transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((p) => !p)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {newPassword && (
                                                <div className="mt-2">
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
                                        </div>

                                        {/* Confirm password */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirm ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
                                                    placeholder="Nhập lại mật khẩu"
                                                    className={[
                                                        "w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none focus:ring-4 transition-all",
                                                        confirmPassword && confirmPassword !== newPassword
                                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                            : "border-gray-300 focus:border-lime-500 focus:ring-lime-500/20"
                                                    ].join(" ")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm((p) => !p)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirm ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {confirmPassword && confirmPassword !== newPassword && (
                                                <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                                            )}
                                            {confirmPassword && confirmPassword === newPassword && (
                                                <p className="text-green-600 text-xs mt-1">✓ Mật khẩu khớp</p>
                                            )}
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => { setStep("otp"); setOtp(Array(OTP_LENGTH).fill("")); setOtpStatus("idle"); setErrorMsg(""); }}
                                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all"
                                            >
                                                ← Quay lại
                                            </button>
                                            <button
                                                onClick={handleResetPassword}
                                                disabled={
                                                    passwordStatus === "loading" ||
                                                    !newPassword || !confirmPassword ||
                                                    newPassword !== confirmPassword ||
                                                    newPassword.length < 6
                                                }
                                                className="flex-1 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl
                                                           shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5
                                                           disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                                                           disabled:translate-y-0 flex items-center justify-center gap-2"
                                            >
                                                {passwordStatus === "loading" ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Đang lưu...
                                                    </>
                                                ) : "Xác nhận"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {step === "otp" && (
                        <p className="text-center text-gray-400 text-xs mt-4">
                            Mã OTP có hiệu lực trong 5 phút
                        </p>
                    )}
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

export default VerifyOtpPage;
