export const quizData = [
    {
        id: 1,
        title: "Bài tập từ vựng về Gia đình",
        duration: "15 phút",
        questionCount: 20,
        level: 1,
        topic: "Gia đình",
        description: "Luyện tập và mở rộng vốn từ vựng tiếng Anh về chủ đề gia đình, bao gồm các thành viên và mối quan hệ quen thuộc trong cuộc sống hằng ngày."
    },
    {
        id: 2,
        title: "Bài tập từ vựng về Động vật",
        duration: "30 phút",
        questionCount: 50,
        level: 3,
        topic: "Động vật",
        description: "Khám phá và ghi nhớ từ vựng tiếng Anh về thế giới động vật, từ các loài quen thuộc đến những loài hiếm gặp trong tự nhiên."
    },
    {
        id: 3,
        title: "Bài tập từ vựng về Thiên nhiên",
        duration: "25 phút",
        questionCount: 40,
        level: 5,
        topic: "Thiên nhiên",
        description: "Luyện tập từ vựng tiếng Anh về thiên nhiên, giúp bạn mô tả cảnh quan, hiện tượng tự nhiên và môi trường xung quanh một cách chính xác."
    },
    {
        id: 4,
        title: "Bài tập từ vựng về Thời tiết",
        duration: "20 phút",
        questionCount: 30,
        level: 3,
        topic: "Thời tiết",
        description: "Rèn luyện vốn từ vựng tiếng Anh về thời tiết, bao gồm các kiểu thời tiết, mùa trong năm và cách diễn đạt thường dùng trong giao tiếp."
    },
    {
        id: 5,
        title: "Bài tập từ vựng về Máy móc và Công nghệ",
        duration: "45 phút",
        questionCount: 60,
        level: 6,
        topic: "Máy móc",
        description: "Nâng cao vốn từ vựng tiếng Anh về máy móc và công nghệ, giúp bạn đọc hiểu tài liệu chuyên ngành và diễn đạt ý tưởng chính xác hơn."
    },
    {
        id: 6,
        title: "Bài tập từ vựng về Học đường",
        duration: "10 phút",
        questionCount: 15,
        level: 1,
        topic: "Học đường",
        description: "Ôn tập từ vựng tiếng Anh về học đường, bao gồm các môn học, đồ dùng học tập và hoạt động quen thuộc trong môi trường giáo dục."
    },
    {
        id: 1,
        title: "Bài tập từ vựng về Gia đình",
        duration: "15 phút",
        questionCount: 20,
        level: 1,
        topic: "Gia đình",
        description: "Luyện tập và mở rộng vốn từ vựng tiếng Anh về chủ đề gia đình, bao gồm các thành viên và mối quan hệ quen thuộc trong cuộc sống hằng ngày."
    },
    {
        id: 2,
        title: "Bài tập từ vựng về Động vật",
        duration: "30 phút",
        questionCount: 50,
        level: 3,
        topic: "Động vật",
        description: "Khám phá và ghi nhớ từ vựng tiếng Anh về thế giới động vật, từ các loài quen thuộc đến những loài hiếm gặp trong tự nhiên."
    },
    {
        id: 3,
        title: "Bài tập từ vựng về Thiên nhiên",
        duration: "25 phút",
        questionCount: 40,
        level: 5,
        topic: "Thiên nhiên",
        description: "Luyện tập từ vựng tiếng Anh về thiên nhiên, giúp bạn mô tả cảnh quan, hiện tượng tự nhiên và môi trường xung quanh một cách chính xác."
    },
    {
        id: 4,
        title: "Bài tập từ vựng về Thời tiết",
        duration: "20 phút",
        questionCount: 30,
        level: 3,
        topic: "Thời tiết",
        description: "Rèn luyện vốn từ vựng tiếng Anh về thời tiết, bao gồm các kiểu thời tiết, mùa trong năm và cách diễn đạt thường dùng trong giao tiếp."
    },
    {
        id: 5,
        title: "Bài tập từ vựng về Máy móc và Công nghệ",
        duration: "45 phút",
        questionCount: 60,
        level: 6,
        topic: "Máy móc",
        description: "Nâng cao vốn từ vựng tiếng Anh về máy móc và công nghệ, giúp bạn đọc hiểu tài liệu chuyên ngành và diễn đạt ý tưởng chính xác hơn."
    },
    {
        id: 6,
        title: "Bài tập từ vựng về Học đường",
        duration: "10 phút",
        questionCount: 15,
        level: 1,
        topic: "Học đường",
        description: "Ôn tập từ vựng tiếng Anh về học đường, bao gồm các môn học, đồ dùng học tập và hoạt động quen thuộc trong môi trường giáo dục."
    }
];


export const getUniqueTopics = () => {
    return [...new Set(quizData.map(quiz => quiz.topic))];
};

export const getUniqueLevels = () => {
    return [...new Set(quizData.map(quiz => quiz.level))].sort((a, b) => a - b);
};
