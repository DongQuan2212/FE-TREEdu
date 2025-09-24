import React, { useState } from 'react';
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import "../../styles/user/flashCardPage.css";
import { flashcardData} from '../../Data/flashcardData';
import {useNavigate} from "react-router-dom";
import iconDictionary from "../../asset/User/dictionary.png";
function DiscoverFlashCardPage() {
    const navigate = useNavigate();
    const [flashcards] = useState(flashcardData);
    const handleStartFlashcard = (flashcardId) => {
        alert(`Bắt đầu học flashcard ID: ${flashcardId}`);
    };
    const handleGoToMyLists = () => {
        navigate('/flashcard/me');
    };
    const handleGoToDiscover = () => {
        navigate('/flashcard/discover');
    };
    return (
        <div>
            <Header/>
            <main className="flashcard-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">Flashcards</h1>
                        <p className="page-description">
                            Học từ vựng hiệu quả với phương pháp flashcard
                        </p>
                    </div>
                    <div className="filter-tabs">
                        <button
                            className="tab-btn"
                            onClick={handleGoToMyLists}
                        >
                            List của tôi
                        </button>
                        <button
                            className="tab-btn active"
                            onClick={handleGoToDiscover}
                        >
                            Khám phá
                        </button>
                    </div>
                    <div>
                        <h1 >Các FlashCard hệ thống</h1>
                    </div>
                    {/* Flashcard Grid */}
                    <div className="flashcard-grid">
                        {flashcards.map(flashcard => (
                            <div key={flashcard.id} className="flashcard-item">
                                <div className="flashcard-content">
                                    <h3 className="flashcard-title">{flashcard.title}</h3>
                                    <div className="flashcard-info">
                                        <div className="word-count">
                                            <span className="count-icon">
                                                <img src={iconDictionary} alt=""/>
                                            </span>
                                            <span className="count-text">{flashcard.word_count} từ</span>
                                        </div>
                                    </div>
                                    <div className="flashcard-actions">
                                        <button
                                            className="flashcard-btn"
                                            onClick={() => handleStartFlashcard(flashcard.id)}
                                        >
                                            Bắt đầu học
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
export default DiscoverFlashCardPage;