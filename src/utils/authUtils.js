// src/utils/authUtils.js

/**
 * Lưu token vào localStorage
 */
export const saveToken = (token) => {
    localStorage.setItem('accessToken', token);

    // Decode JWT để lấy thời gian hết hạn
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        localStorage.setItem('tokenExpiry', expiryTime);
    } catch (error) {
        console.error('Cannot decode JWT token:', error);
    }
};

/**
 * Lấy token từ localStorage
 */
export const getToken = () => {
    return localStorage.getItem('accessToken');
};

/**
 * Xóa token (logout)
 */
export const removeToken = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
};

/**
 * Kiểm tra user đã đăng nhập chưa
 */
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Kiểm tra token có hết hạn chưa
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && Date.now() > parseInt(expiry)) {
        removeToken();
        return false;
    }

    return true;
};

/**
 * Decode JWT token để lấy thông tin user
 */
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.sub,
            role: payload.role[0]?.authority || 'ROLE_MEMBER',
            exp: payload.exp,
            iat: payload.iat
        };
    } catch (error) {
        console.error('Cannot decode token:', error);
        return null;
    }
};

/**
 * Kiểm tra user có role cụ thể không
 */
export const hasRole = (requiredRole) => {
    const user = getUserFromToken();
    if (!user) return false;

    return user.role === requiredRole;
};

/**
 * Logout user
 */
export const logout = () => {
    removeToken();
    window.location.href = '/login';
};
