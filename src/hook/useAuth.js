import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axiosConfig';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm gọi song song cả 2 API để lấy thông tin toàn diện
    const fetchFullUserData = async () => {
        // Chạy song song cả API Auth gốc và API lấy profile chi tiết
        const [authResponse, meResponse] = await Promise.all([
            axiosInstance.post('/auth/current-user'),
            axiosInstance.get('/users/me')
        ]);

        const authData = authResponse.data.data;
        // Đề phòng trường hợp API /me bọc data hoặc trả trực tiếp object
        const meData = meResponse.data?.data || meResponse.data;

        // Hợp nhất dữ liệu để giữ tương thích ngược 100% với code cũ
        return {
            id: authData.id || meData.id,
            email: authData.email || meData.email,
            role: authData.role,                       // Giữ nguyên Role phục vụ phân quyền
            name: meData.fullName || authData.name,    // Giữ thuộc tính 'name' cho code cũ
            fullName: meData.fullName,                 // Thuộc tính mới từ API /me
            avatarUrl: meData.avatarUrl,               // Thêm ảnh đại diện thực tế
            streakCount: meData.streakCount || 0,
            longestStreak: meData.longestStreak || 0,
            xp: meData.xp || 0,
            level: meData.level || 1,
            totalQuizCompleted: meData.totalQuizCompleted || 0,
            totalFlashcardLearned: meData.totalFlashcardLearned || 0,
            phoneNumber: meData.phoneNumber,
            address: meData.address,
            gender: meData.gender
        };
    };

    const loadUser = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Đọc nhanh từ localStorage (Cache UI) để tránh giật lag màn hình
            const cachedUser = localStorage.getItem('userInfo');
            if (cachedUser) {
                const parsedUser = JSON.parse(cachedUser);
                setUser(parsedUser);
                setLoading(false);

                // Âm thầm fetch lại dưới nền để đồng bộ dữ liệu mới nhất (Ví dụ: vừa tăng streak/xp)
                try {
                    const fullInfo = await fetchFullUserData();
                    if (JSON.stringify(fullInfo) !== JSON.stringify(parsedUser)) {
                        localStorage.setItem('userInfo', JSON.stringify(fullInfo));
                        setUser(fullInfo);
                    }
                } catch (err) {
                    if (err.response?.status === 401) {
                        localStorage.removeItem('userInfo');
                        setUser(null);
                    }
                }
                return;
            }

            // 2. Nếu không có cache, thực hiện gọi mới
            const fullInfo = await fetchFullUserData();
            localStorage.setItem('userInfo', JSON.stringify(fullInfo));
            setUser(fullInfo);
            setError(null);
        } catch (err) {
            console.error('Failed to load user:', err);
            setUser(null);
            localStorage.removeItem('userInfo');

            if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn');
            } else {
                setError('Không thể tải thông tin người dùng');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm Đăng xuất
    const logout = useCallback(async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('userInfo');
            setUser(null);
            window.location.href = '/login';
        }
    }, []);

    const hasRole = useCallback((requiredRole) => user?.role === requiredRole, [user]);
    const hasAnyRole = useCallback((roles) => roles.includes(user?.role), [user]);
    const isAdmin = useCallback(() => user?.role === 'ROLE_ADMIN', [user]);
    const isSupporter = useCallback(() => user?.role === 'ROLE_SUPPORTER', [user]);
    const isMember = useCallback(() => user?.role === 'ROLE_MEMBER', [user]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        logout,
        refetchUser: loadUser,
        hasRole,
        hasAnyRole,
        isAdmin,
        isSupporter,
        isMember,
    };
};

export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SUPPORTER: 'ROLE_SUPPORTER',
    MEMBER: 'ROLE_MEMBER',
};
