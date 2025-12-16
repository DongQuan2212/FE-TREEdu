import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../config/axiosConfig';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user từ localStorage hoặc API
    const loadUser = useCallback(async () => {
        try {
            setLoading(true);

            // Đọc từ localStorage trước (cache)
            const cachedUser = localStorage.getItem('userInfo');
            if (cachedUser) {
                const parsedUser = JSON.parse(cachedUser);
                setUser(parsedUser);
                setLoading(false);

                // Vẫn fetch từ API để verify token còn hợp lệ không
                try {
                    const response = await axiosInstance.post('/auth/current-user');
                    const userData = response.data.data;

                    const userInfo = {
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                    };

                    // Cập nhật nếu có thay đổi
                    if (JSON.stringify(userInfo) !== JSON.stringify(parsedUser)) {
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                        setUser(userInfo);
                    }
                } catch (err) {
                    // Token không hợp lệ, xóa cache
                    if (err.response?.status === 401) {
                        localStorage.removeItem('userInfo');
                        setUser(null);
                    }
                }
                return;
            }

            // Nếu không có cache, fetch từ API
            const response = await axiosInstance.post('/auth/current-user');
            const userData = response.data.data;

            const userInfo = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
            };

            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            setUser(userInfo);
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

    // Logout function
    const logout = useCallback(async () => {
        try {
            // Gọi API logout để xóa cookie ở server
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa localStorage và redirect
            localStorage.removeItem('userInfo');
            setUser(null);
            window.location.href = '/login';
        }
    }, []);

    // Check role functions
    const hasRole = useCallback((requiredRole) => {
        return user?.role === requiredRole;
    }, [user]);

    const hasAnyRole = useCallback((roles) => {
        return roles.includes(user?.role);
    }, [user]);

    const isAdmin = useCallback(() => {
        return user?.role === 'ROLE_ADMIN';
    }, [user]);

    const isSupporter = useCallback(() => {
        return user?.role === 'ROLE_SUPPORTER';
    }, [user]);

    const isMember = useCallback(() => {
        return user?.role === 'ROLE_MEMBER';
    }, [user]);

    // Load user khi component mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        user,                      // Thông tin user hiện tại
        loading,                   // Đang load user
        error,                     // Lỗi nếu có
        isAuthenticated: !!user,   // Đã đăng nhập chưa
        logout,                    // Hàm logout
        refetchUser: loadUser,     // Hàm load lại user
        hasRole,                   // Kiểm tra 1 role cụ thể
        hasAnyRole,                // Kiểm tra nhiều role
        isAdmin,                   // Shortcut check admin
        isSupporter,               // Shortcut check supporter
        isMember,                  // Shortcut check member
    };
};

// Export constants cho roles
export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SUPPORTER: 'ROLE_SUPPORTER',
    MEMBER: 'ROLE_MEMBER',
};
