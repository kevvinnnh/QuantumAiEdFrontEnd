// src/components/AdminDashboard.tsx
import React, { useState } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [readingTitle, setReadingTitle] = useState('');
  const [readingContent, setReadingContent] = useState('');
  const [quizData, setQuizData] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleUploadLesson = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/admin/upload_lesson`,
        { title: lessonTitle, description: lessonDescription },
        { withCredentials: true }
      );
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Error uploading lesson');
      console.error(error);
    }
  };

  const handleUploadReading = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', readingTitle);
    formData.append('content', readingContent);
    // Append files if needed, e.g., an image:
    // formData.append('image', selectedImageFile);
    try {
      const response = await axios.post(
        `${backendUrl}/admin/upload_reading`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Error uploading reading');
      console.error(error);
    }
  };

  const handleUploadQuiz = async () => {
    try {
      // Here, quizData should be a JSON object representing the quiz.
      const response = await axios.post(
        `${backendUrl}/admin/upload_quiz`,
        { questions: JSON.parse(quizData) },
        { withCredentials: true }
      );
      setUploadMessage(response.data.message);
    } catch (error) {
      setUploadMessage('Error uploading quiz');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin! Use the forms below to upload new content.</p>

      <section style={{ marginBottom: '40px' }}>
        <h2>Upload Lesson</h2>
        <input
          type="text"
          placeholder="Lesson Title"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <textarea
          placeholder="Lesson Description"
          value={lessonDescription}
          onChange={(e) => setLessonDescription(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button onClick={handleUploadLesson} style={{ padding: '10px 20px' }}>
          Upload Lesson
        </button>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Upload Reading</h2>
        <form onSubmit={handleUploadReading}>
          <input
            type="text"
            placeholder="Reading Title"
            value={readingTitle}
            onChange={(e) => setReadingTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <textarea
            placeholder="Reading Content"
            value={readingContent}
            onChange={(e) => setReadingContent(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input type="file" name="image" style={{ marginBottom: '10px' }} />
          <input type="file" name="video" style={{ marginBottom: '10px' }} />
          <button type="submit" style={{ padding: '10px 20px' }}>
            Upload Reading
          </button>
        </form>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>Upload Quiz</h2>
        <textarea
          placeholder='Enter quiz JSON (e.g., [{"question": "Q?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}, ...])'
          value={quizData}
          onChange={(e) => setQuizData(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '150px' }}
        />
        <button onClick={handleUploadQuiz} style={{ padding: '10px 20px' }}>
          Upload Quiz
        </button>
      </section>

      {uploadMessage && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0ffe0' }}>
          {uploadMessage}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
