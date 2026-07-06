import React, { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { notificationAPI } from "../../config/api";

const AppealModal = ({ notification, onClose }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!notification) return null;

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert("Vui lòng nhập nội dung kháng cáo");
            return;
        }

        try {
            setLoading(true);

            await notificationAPI.sendAppeal({
                content
            });

            setSent(true);
            setContent("");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Không thể gửi kháng cáo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black/65 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">

            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden z-10">

                {sent ? (
                    <div className="p-8 text-center">

                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-7 h-7 text-green-600" />
                        </div>

                        <h2 className="text-xl font-bold">
                            Đã gửi kháng cáo
                        </h2>

                        <p className="text-sm text-neutral-500 mt-2">
                            Quản trị viên sẽ xem xét và phản hồi sớm nhất.
                        </p>

                        <button
                            onClick={onClose}
                            className="mt-6 px-5 py-2 rounded-xl bg-emerald-600 text-white"
                        >
                            Đóng
                        </button>

                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b flex justify-between items-center">

                            <h2 className="text-2xl font-bold">
                                Gửi kháng cáo
                            </h2>

                            <button onClick={onClose}>
                                <X size={20} />
                            </button>

                        </div>

                        <div className="p-6">

                            <p className="text-sm text-neutral-500 mb-4">
                                Giải thích lý do bạn cho rằng việc hạn chế quyền là chưa chính xác.
                            </p>

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Nhập nội dung kháng cáo..."
                                className="w-full h-32 border rounded-xl p-4 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                            />

                            <div className="flex justify-end gap-3 mt-5">

                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border"
                                >
                                    Hủy
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-lg bg-amber-600 text-white"
                                >
                                    {loading ? "Đang gửi..." : "Gửi kháng cáo"}
                                </button>

                            </div>

                        </div>
                    </>
                )}

            </div>

        </div>
    );
};

export default AppealModal;