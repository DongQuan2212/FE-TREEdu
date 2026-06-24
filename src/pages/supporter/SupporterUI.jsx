/**
 * SupporterUI.jsx
 * Shared primitive components dùng chung cho toàn bộ Supporter pages.
 * Import từ đây để đảm bảo giao diện đồng nhất.
 */

import React from 'react';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SupporterSidebar from '../../components/Supporter/SupporterSidebar';

// ─── Layout Shell ─────────────────────────────────────────────────────────────
// Bọc toàn bộ page: sidebar + main area
export const PageShell = ({ children, pendingReports }) => (
    <div className="min-h-screen bg-neutral-50 flex font-sans antialiased">
        <SupporterSidebar pendingReports={pendingReports} />
        <div className="flex-1 ml-60 flex flex-col min-w-0">
            {children}
        </div>
    </div>
);

// ─── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, backTo, actions }) => {
    const navigate = useNavigate();
    return (
        <header className="bg-white border-b border-neutral-100 sticky top-0 z-40 px-7 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                {backTo && (
                    <button
                        onClick={() => navigate(backTo)}
                        className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <div className="min-w-0">
                    <h1 className="text-base font-semibold text-neutral-900 leading-tight truncate">{title}</h1>
                    {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </header>
    );
};

// ─── Buttons ──────────────────────────────────────────────────────────────────
export const BtnPrimary = ({ children, onClick, disabled, className = '', type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

export const BtnSecondary = ({ children, onClick, disabled, className = '', type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-medium transition disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

export const BtnDanger = ({ children, onClick, disabled, className = '', type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50 ${className}`}
    >
        {children}
    </button>
);

export const BtnSave = ({ children, onClick, disabled, submitting }) => (
    <button
        onClick={onClick}
        disabled={disabled || submitting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-sm font-medium transition disabled:opacity-50"
    >
        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
    </button>
);

// ─── Filter Bar ───────────────────────────────────────────────────────────────
export const FilterBar = ({ children }) => (
    <div className="bg-white border border-neutral-100 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {children}
        </div>
    </div>
);

export const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm...' }) => (
    <div className="relative md:col-span-2">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
        />
    </div>
);

export const FilterSelect = ({ value, onChange, children }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white transition"
    >
        {children}
    </select>
);

// ─── Data Table ───────────────────────────────────────────────────────────────
export const DataTable = ({ headers, children, loading, empty, emptyIcon: EmptyIcon }) => {
    if (loading) return (
        <div className="bg-white border border-neutral-100 rounded-xl p-16 flex flex-col items-center gap-3 text-neutral-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
    );

    if (empty) return (
        <div className="bg-white border border-neutral-100 rounded-xl p-16 flex flex-col items-center gap-3 text-neutral-400">
            {EmptyIcon && <EmptyIcon className="w-12 h-12 text-neutral-200" />}
            <span className="text-sm">{empty}</span>
        </div>
    );

    return (
        <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/60">
                        {headers.map((h, i) => (
                            <th key={i} className={`px-5 py-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider ${h.center ? 'text-center' : 'text-left'}`}>
                                {h.label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                    {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const Td = ({ children, center, className = '' }) => (
    <td className={`px-5 py-3.5 ${center ? 'text-center' : ''} ${className}`}>{children}</td>
);

// ─── Badges / Pills ───────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'gray' }) => {
    const colors = {
        gray:   'bg-neutral-100 text-neutral-600',
        blue:   'bg-blue-50 text-blue-700',
        purple: 'bg-purple-50 text-purple-700',
        emerald:'bg-emerald-50 text-emerald-700',
        amber:  'bg-amber-50 text-amber-700',
        red:    'bg-red-50 text-red-600',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${colors[color]}`}>
            {children}
        </span>
    );
};

// ─── Icon Action Buttons (in table rows) ─────────────────────────────────────
export const IconBtn = ({ onClick, title, color = 'gray', children }) => {
    const colors = {
        gray:   'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700',
        blue:   'text-blue-500 hover:bg-blue-50 hover:text-blue-700',
        amber:  'text-amber-500 hover:bg-amber-50 hover:text-amber-700',
        red:    'text-red-500 hover:bg-red-50 hover:text-red-700',
        emerald:'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-lg transition ${colors[color]}`}
        >
            {children}
        </button>
    );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const Pagination = ({ currentPage, totalPages, totalElements, shown, onPrev, onNext }) => (
    <div className="px-5 py-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>Hiển thị {shown} trong {totalElements}</span>
        <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={currentPage === 0} className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 transition">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="px-2.5 py-1 bg-neutral-900 text-white rounded text-[10px] font-medium">
                {currentPage + 1} / {totalPages}
            </span>
            <button onClick={onNext} disabled={currentPage === totalPages - 1} className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 transition">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>
    </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, variant = 'danger' }) => {
    if (!isOpen) return null;
    const isEmerald = variant === 'emerald';
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isEmerald ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-xs text-neutral-500 mb-5 leading-relaxed">{message}</p>
                <div className="flex gap-2">
                    <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition disabled:opacity-50">
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition disabled:opacity-60 ${isEmerald ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Form Primitives ──────────────────────────────────────────────────────────
export const FormCard = ({ children, className = '' }) => (
    <div className={`bg-white border border-neutral-100 rounded-xl p-6 ${className}`}>
        {children}
    </div>
);

export const FormLabel = ({ children, required }) => (
    <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

export const FormInput = ({ error, ...props }) => (
    <input
        {...props}
        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition ${error ? 'border-red-300' : 'border-neutral-200'}`}
    />
);

export const FormTextarea = ({ rows = 3, ...props }) => (
    <textarea
        rows={rows}
        {...props}
        className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition resize-none"
    />
);

export const FormSelect = ({ children, ...props }) => (
    <select
        {...props}
        className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white transition"
    >
        {children}
    </select>
);

export const FormError = ({ message }) => message ? (
    <p className="mt-1.5 text-xs text-red-600">{message}</p>
) : null;

// ─── Page Content Wrapper ─────────────────────────────────────────────────────
export const PageContent = ({ children, className = '' }) => (
    <main className={`p-7 flex-1 flex flex-col gap-5 ${className}`}>
        {children}
    </main>
);
