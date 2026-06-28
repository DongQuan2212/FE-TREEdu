// pages/verify-result.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyResultPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);

    const status = searchParams.get('status');
    const message = searchParams.get('message');

    useEffect(() => {
        if (status === 'success' || status === 'already') {
            // Đếm ngược và redirect về login
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [status, navigate]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
                            <svg className="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Xác thực thành công!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {message || 'Tài khoản của bạn đã được kích hoạt.'}
                        </p>
                        <p className="mt-4 text-sm text-gray-500">
                            Đang chuyển đến trang đăng nhập trong {countdown} giây...
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                );

            case 'already':
                return (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100">
                            <svg className="h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Tài khoản đã được kích hoạt
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {message || 'Tài khoản này đã được xác thực trước đó.'}
                        </p>
                        <p className="mt-4 text-sm text-gray-500">
                            Đang chuyển đến trang đăng nhập trong {countdown} giây...
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
                            <svg className="h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Xác thực thất bại
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {message || 'Đã xảy ra lỗi trong quá trình xác thực.'}
                        </p>
                        <div className="mt-6 space-x-4">
                            <button
                                onClick={() => navigate('/verify-email')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Nhập mã thủ công
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Đăng ký lại
                            </button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Đang xử lý...
                        </h2>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {renderContent()}
            </div>
        </div>
    );
}
