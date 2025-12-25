// src/utils/confirmation.js
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Cấu hình chung cho nút bấm
const commonBtnClass = {
    confirmButton: 'font-bold px-6 py-2.5 rounded-lg shadow-md',
    cancelButton: 'font-bold px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'
};

/**
 * 1. Dialog Xác nhận (Yes/No)
 */
export const showConfirmDialog = async ({
                                            title = "Bạn chắc chắn chứ?",
                                            text = "",
                                            confirmText = "Đồng ý",
                                            cancelText = "Hủy"
                                        }) => {
    const result = await MySwal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#18181b', // Zinc-900
        cancelButtonColor: '#ffffff',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
        focusCancel: true,
        customClass: {
            popup: 'rounded-2xl',
            ...commonBtnClass
        }
    });
    return result.isConfirmed;
};

/**
 * 2. Dialog Thông báo Lỗi (Chỉ có nút Đóng)
 */
export const showErrorDialog = async (text = "Đã có lỗi xảy ra", title = "Lỗi!") => {
    return MySwal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#ef4444', // Red-500
        confirmButtonText: 'Đóng',
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: commonBtnClass.confirmButton
        }
    });
};

/**
 * 3. Dialog Thành công (Tự tắt hoặc bấm đóng)
 */
export const showSuccessDialog = async (text = "Thao tác thành công", title = "Tuyệt vời!") => {
    return MySwal.fire({
        title,
        text,
        icon: 'success',
        timer: 2000, // Tự tắt sau 2s
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-2xl'
        }
    });
};

/**
 * 4. Dialog Thông báo (Info - Dùng cho Hết giờ v.v...)
 */
export const showInfoDialog = async (text, title = "Thông báo") => {
    return MySwal.fire({
        title,
        text,
        icon: 'info',
        confirmButtonColor: '#3b82f6', // Blue-500
        confirmButtonText: 'Đã hiểu',
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: commonBtnClass.confirmButton
        }
    });
};
