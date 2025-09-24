import React, { useState } from 'react';
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import "../../styles/user/flashCardPage.css";
import { myFlashcardsData} from '../../Data/MyCardData';
import {useNavigate} from "react-router-dom";

import iconbook from "../../asset/User/book.png"
import iconadd from "../../asset/User/plus.png"
import iconDictionary from "../../asset/User/dictionary.png"

function MyFlashCardPage() {
    const navigate = useNavigate();
    const [myFlashcards] = useState(myFlashcardsData);

    const handleStartFlashcard = (flashcardId) => {
        alert(`Bắt đầu học flashcard ID: ${flashcardId}`);
    };

    const handleCreateNewFlashcard = () => {
        alert('Tạo flashcard mới! Navigate to /flashcard/create');
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
                        <h1 className="page-title"> Flashcards</h1>
                        <p className="page-description">
                            Học từ vựng hiệu quả với phương pháp flashcard
                        </p>
                    </div>

                    <div className="filter-tabs">
                        <button
                            className="tab-btn active"
                            onClick={handleGoToMyLists}
                        >
                            List của tôi
                        </button>
                        <button
                            className="tab-btn"
                            onClick={handleGoToDiscover}
                        >
                            Khám phá
                        </button>
                    </div>
                    <div>
                        <h1>Các FlashCard của tôi</h1>
                    </div>
                    {/* Flashcard Grid */}
                    <div className="flashcard-grid">
                        {/* Create New Flashcard Card */}
                        <div className="flashcard-item create-new">
                            <div className="flashcard-content">
                                <div className="create-icon">
                                    <img src={iconadd} alt=""/>
                                </div>
                                <h3 className="create-title">Tạo flashcard mới</h3>
                                <p className="create-description">
                                    Tạo bộ flashcard của riêng bạn để học từ vựng hiệu quả hơn
                                </p>
                                <div className="flashcard-actions">
                                    <button
                                        className="flashcard-btn create-btn"
                                        onClick={handleCreateNewFlashcard}
                                    >
                                        Tạo mới
                                    </button>
                                </div>
                            </div>
                        </div>
                        {myFlashcards.map(flashcard => (
                            <div>
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
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}

export default MyFlashCardPage;