import React from "react";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";

const CommunityGuidelinesPage = () => {
    console.log("CommunityGuidelinesPage");
    return (
        <>
            <Header />

            <main className="min-h-screen bg-zinc-50 pt-28 pb-20">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-10">

                    <h1 className="text-4xl font-black text-zinc-900 mb-3">
                        Tiêu chuẩn cộng đồng học tập
                    </h1>

                    <p className="text-zinc-500 mb-10">
                        TREEdu mong muốn xây dựng một môi trường học tập an toàn,
                        lành mạnh và tôn trọng lẫn nhau. Mọi người dùng đều có
                        trách nhiệm tuân thủ các tiêu chuẩn dưới đây khi sử dụng hệ thống.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-3">
                            1. Mục tiêu
                        </h2>

                        <p className="text-zinc-700 leading-8">
                            Khuyến khích chia sẻ kiến thức, tạo các bộ thẻ học tập
                            chất lượng và hỗ trợ cộng đồng học tập phát triển tích cực.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-3">
                            2. Nội dung được khuyến khích
                        </h2>

                        <ul className="list-disc ml-6 space-y-2 text-zinc-700 leading-8">
                            <li>Từ vựng và kiến thức phục vụ học tập.</li>
                            <li>Bộ thẻ chính xác, rõ ràng, dễ hiểu.</li>
                            <li>Ví dụ mang tính giáo dục.</li>
                            <li>Hình ảnh và âm thanh có quyền sử dụng hợp pháp.</li>
                            <li>Chia sẻ kiến thức có ích cho cộng đồng.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-3 text-red-600">
                            3. Nội dung bị nghiêm cấm
                        </h2>

                        <ul className="list-disc ml-6 space-y-2 text-zinc-700 leading-8">
                            <li>Nội dung xúc phạm, lăng mạ hoặc quấy rối người khác.</li>
                            <li>Ngôn từ kích động thù hận hoặc phân biệt đối xử.</li>
                            <li>Nội dung khiêu dâm, phản cảm.</li>
                            <li>Nội dung bạo lực hoặc cổ súy hành vi nguy hiểm.</li>
                            <li>Spam hoặc tạo nhiều bộ thẻ giống nhau.</li>
                            <li>Thông tin sai lệch gây ảnh hưởng đến việc học.</li>
                            <li>Quảng cáo trái phép.</li>
                            <li>Vi phạm bản quyền.</li>
                            <li>Đính kèm liên kết độc hại hoặc mã độc.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-3">
                            4. Trách nhiệm của người dùng
                        </h2>

                        <ul className="list-disc ml-6 space-y-2 text-zinc-700 leading-8">
                            <li>Chịu trách nhiệm về nội dung đã tạo.</li>
                            <li>Tôn trọng các thành viên khác.</li>
                            <li>Không đăng tải nội dung vi phạm.</li>
                            <li>Báo cáo nội dung không phù hợp khi phát hiện.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-3">
                            5. Xử lý vi phạm
                        </h2>

                        <p className="text-zinc-700 leading-8 mb-4">
                            Khi phát hiện nội dung vi phạm, hệ thống hoặc quản trị viên
                            có thể áp dụng một hoặc nhiều biện pháp sau:
                        </p>

                        <ul className="list-disc ml-6 space-y-2 text-zinc-700 leading-8">
                            <li>Ẩn bộ thẻ khỏi cộng đồng.</li>
                            <li>Đánh dấu bộ thẻ là vi phạm.</li>
                            <li>Không cho phép chuyển sang chế độ công khai.</li>
                            <li>Yêu cầu chỉnh sửa nội dung.</li>
                            <li>Xóa bộ thẻ.</li>
                            <li>Tạm khóa hoặc khóa vĩnh viễn tài khoản nếu vi phạm nhiều lần.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">
                            6. Báo cáo vi phạm
                        </h2>

                        <p className="text-zinc-700 leading-8">
                            Người dùng có thể sử dụng chức năng báo cáo trên từng bộ thẻ
                            để gửi phản ánh đến quản trị viên. Mọi báo cáo sẽ được xem
                            xét và xử lý trong thời gian sớm nhất nhằm đảm bảo chất lượng
                            của cộng đồng học tập TREEdu.
                        </p>
                    </section>

                </div>
            </main>

            <Footer />
        </>
    );
};

export default CommunityGuidelinesPage;