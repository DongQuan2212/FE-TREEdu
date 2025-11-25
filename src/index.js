import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 800,        // thời gian animation
    easing: 'ease-out-cubic',
    once: false,          // Đổi thành false → chạy lại mỗi khi scroll qua
    mirror: true,         // SIÊU HAY: khi scroll lên thì animation sẽ chạy ngược lại!
    offset: 100,
    anchorPlacement: 'top-bottom', // mượt hơn
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

reportWebVitals();
