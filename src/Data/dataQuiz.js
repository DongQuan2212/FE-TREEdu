export const quizData = [
    {
        id: 1,
        title: "Bài tập từ vựng về Gia đình",
        duration: "15 phút",
        questionCount: 20,
        level: 1,
        topic: "Gia đình",
        description: "Luyện tập và mở rộng vốn từ vựng tiếng Anh về chủ đề gia đình, bao gồm các thành viên và mối quan hệ quen thuộc trong cuộc sống hằng ngày.",
        passingScore: 60
    },
    {
        id: 2,
        title: "Bài tập từ vựng về Động vật",
        duration: "30 phút",
        questionCount: 50,
        level: 3,
        topic: "Động vật",
        description: "Khám phá và ghi nhớ từ vựng tiếng Anh về thế giới động vật, từ các loài quen thuộc đến những loài hiếm gặp trong tự nhiên.",
        passingScore: 60
    },
    {
        id: 3,
        title: "Bài tập từ vựng về Thiên nhiên",
        duration: "25 phút",
        questionCount: 40,
        level: 5,
        topic: "Thiên nhiên",
        description: "Luyện tập từ vựng tiếng Anh về thiên nhiên, giúp bạn mô tả cảnh quan, hiện tượng tự nhiên và môi trường xung quanh một cách chính xác.",
        passingScore: 60
    },
    {
        id: 4,
        title: "Bài tập từ vựng về Thời tiết",
        duration: "20 phút",
        questionCount: 30,
        level: 3,
        topic: "Thời tiết",
        description: "Rèn luyện vốn từ vựng tiếng Anh về thời tiết, bao gồm các kiểu thời tiết, mùa trong năm và cách diễn đạt thường dùng trong giao tiếp.",
        passingScore: 60
    },
    {
        id: 5,
        title: "Bài tập từ vựng về Máy móc và Công nghệ",
        duration: "45 phút",
        questionCount: 60,
        level: 6,
        topic: "Máy móc",
        description: "Nâng cao vốn từ vựng tiếng Anh về máy móc và công nghệ, giúp bạn đọc hiểu tài liệu chuyên ngành và diễn đạt ý tưởng chính xác hơn.",
        passingScore: 60
    },
    {
        id: 6,
        title: "Bài tập từ vựng về Học đường",
        duration: "10 phút",
        questionCount: 15,
        level: 1,
        topic: "Học đường",
        description: "Ôn tập từ vựng tiếng Anh về học đường, bao gồm các môn học, đồ dùng học tập và hoạt động quen thuộc trong môi trường giáo dục.",
        passingScore: 60
    },
];
export const questionData = [
    // Quiz 1 - Gia đình
    {
        id: 1,
        quizId: 1,
        type: "multiple-choice", // multiple-choice, true-false, fill-in-blank
        question: "Từ nào sau đây có nghĩa là 'bà nội' trong tiếng Anh?",
        options: [
            "Grandmother",
            "Grandfather",
            "Aunt",
            "Uncle"
        ],
        correctAnswer: 0, // index của đáp án đúng
        explanation: "Grandmother là từ chỉ bà (cả bà nội và bà ngoại) trong tiếng Anh."
    },
    {
        id: 2,
        quizId: 1,
        type: "multiple-choice",
        question: "Từ 'sibling' có nghĩa là gì?",
        options: [
            "Con cái",
            "Cha mẹ",
            "Anh chị em ruột",
            "Ông bà"
        ],
        correctAnswer: 2,
        explanation: "Sibling là từ chỉ anh chị em ruột (có chung cha mẹ)."
    },
    {
        id: 3,
        quizId: 1,
        type: "true-false",
        question: "Từ 'nephew' có nghĩa là cháu gái.",
        correctAnswer: false,
        explanation: "Nephew là cháu trai. Cháu gái là 'niece'."
    },
    {
        id: 4,
        quizId: 1,
        type: "fill-in-blank",
        question: "My father's brother is my _____.",
        correctAnswer: "uncle",
        acceptableAnswers: ["uncle"], // có thể có nhiều đáp án chấp nhận được
        explanation: "Anh/em trai của bố là chú/bác."
    },

    // Quiz 2 - Động vật
    {
        id: 5,
        quizId: 2,
        type: "multiple-choice",
        question: "Con vật nào sau đây là động vật có vú?",
        options: [
            "Cá mập",
            "Cá voi",
            "Cá heo",
            "Cả B và C"
        ],
        correctAnswer: 3,
        explanation: "Cả cá voi và cá heo đều là động vật có vú sống trong nước."
    },
    {
        id: 6,
        quizId: 2,
        type: "multiple-choice",
        question: "Từ 'feline' được dùng để chỉ:",
        options: [
            "Họ chó",
            "Họ mèo",
            "Họ gấu",
            "Họ khỉ"
        ],
        correctAnswer: 1,
        explanation: "Feline là tính từ chỉ thuộc về họ mèo (cats)."
    }
];

export const getUniqueTopics = () => {
    return [...new Set(quizData.map(quiz => quiz.topic))];
};

export const getUniqueLevels = () => {
    return [...new Set(quizData.map(quiz => quiz.level))].sort((a, b) => a - b);
};
export const getQuizById = (id) => {
    return quizData.find(quiz => quiz.id === parseInt(id));
};

export const getQuestionsByQuizId = (quizId) => {
    return questionData.filter(question => question.quizId === parseInt(quizId));
};

export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};