# 🌱 TREEdu – Học Tiếng Việt Trực Tuyến

TREEdu là ứng dụng web hỗ trợ học **Tiếng Việt cho người nước ngoài**, với các tính năng như quiz, flashcard và luyện phát âm.  
Dự án tập trung vào việc mang đến trải nghiệm học tập hiện đại, trực quan và dễ sử dụng.

---

## ✨ Tính năng chính

-  📘 **Bài quiz** – Hệ thống câu hỏi trắc nghiệm giúp ôn luyện kiến thức.
  - 📝 **Flashcard** – Học từ vựng trực quan bằng hình ảnh và nghĩa.
  - 🎤 **Phòng luyện phát âm** – Nghe và luyện phát âm theo mẫu chuẩn.
  - 💻 **Giao diện thân thiện** – Thiết kế trực quan, sử dụng được trên cả máy tính & điện thoại.
  - 🌱 **Hỗ trợ người mới bắt đầu** – Phù hợp cho người nước ngoài học Tiếng Việt cơ bản.

---

## 🛠️ Công nghệ sử dụng

- ⚛️ **ReactJS** – UI library
  - 🔀 **React Router** – Điều hướng trang
  - 🎠 **SwiperJS** – Carousel/slider
  - 🌐 **Axios** – HTTP client
  - 🎨 **CSS Modules / TailwindCSS** – Quản lý giao diện

---
## 🚀 Cài đặt & Chạy dự án

```bash
# Clone repo
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Cài đặt dependencies
npm install
# hoặc
yarn install

# Chạy project ở localhost:3000
npm start
# hoặc
yarn start
```

---
## 📂 Cấu trúc thư mục
```bash
src/
│── asset/             # Chứa các thành phần như ảnh     
│── components/        # Các thành phần dùng chung (Header, Footer, ...)
│── routes/            # Định tuyến trang
│── services/          # API service (Axios)
│── styles/            # CSS
│── pages/             # Các trang chính (Home, Login, Register, ...)
│── App.js             # Cấu hình React Router
│── index.js           # Điểm vào ứng dụng
```