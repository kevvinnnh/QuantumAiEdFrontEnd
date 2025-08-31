// src/components/AdminDashboard/AdminDashboard.tsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.scss';

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
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>Welcome, Admin! Use the forms below to upload new content.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upload Lesson</h2>
        <input
          type="text"
          placeholder="Lesson Title"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          className={styles.input}
        />
        <textarea
          placeholder="Lesson Description"
          value={lessonDescription}
          onChange={(e) => setLessonDescription(e.target.value)}
          className={styles.textarea}
        />
        <button onClick={handleUploadLesson} className={styles.button}>
          Upload Lesson
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upload Reading</h2>
        <form onSubmit={handleUploadReading} className={styles.form}>
          <input
            type="text"
            placeholder="Reading Title"
            value={readingTitle}
            onChange={(e) => setReadingTitle(e.target.value)}
            className={styles.input}
          />
          <textarea
            placeholder="Reading Content"
            value={readingContent}
            onChange={(e) => setReadingContent(e.target.value)}
            className={styles.textarea}
          />
          <input type="file" name="image" className={styles.fileInput} />
          <input type="file" name="video" className={styles.fileInput} />
          <button type="submit" className={styles.button}>
            Upload Reading
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upload Quiz</h2>
        <textarea
          placeholder='Enter quiz JSON (e.g., [{"question": "Q?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}, ...])'
          value={quizData}
          onChange={(e) => setQuizData(e.target.value)}
          className={`${styles.textarea} ${styles.textareaLarge}`}
        />
        <button onClick={handleUploadQuiz} className={styles.button}>
          Upload Quiz
        </button>
      </section>

      {uploadMessage && (
        <div className={styles.message}>
          {uploadMessage}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;