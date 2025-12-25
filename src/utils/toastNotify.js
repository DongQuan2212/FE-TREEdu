import { toast } from 'react-toastify';

export const notify = {
    success: (message) => {
        toast.success(message, {
            style: { border: '1px solid #4caf50', color: '#4caf50' },
            icon: '🎉',
            position: "top-right",
            autoClose: 3000,
        });
    },
    warning: (message) => toast.warn(message, { icon: '⚠️' }),
    error: (message) => {
        toast.error(message || 'Có lỗi xảy ra, vui lòng thử lại!', { icon: '❌' });
    }
};
