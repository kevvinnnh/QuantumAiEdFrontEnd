# Quantaid Frontend

React + TypeScript + Vite frontend for the Quantaid learning platform. Quantaid is an AI-powered platform designed to bridge the educational gap in early quantum computing instruction by delivering personalized feedback and adaptive learning experiences.

## Deployed Frontend

[https://quantum-ai-ed-front-end-smoky.vercel.app/](https://quantum-ai-ed-front-end-smoky.vercel.app/)

## Backend

This app communicates with the [Flask-based backend](https://github.com/kevvinnnh/QuantumAiEdBackEnd) at the URL defined in `VITE_BACKEND_URL`. Be sure the backend is running locally on port `5000` or update the value accordingly.

## Development

```bash
git clone https://github.com/kevvinnnh/QuantumAiEdFrontEnd.git
cd QuantumAiEdFrontEnd/frontend
npm install
cp .env.example .env  # Fill in the necessary keys in .env
npm run dev           # Start dev server with HMR
npm run build         # Production build
npx tsc --noEmit      # Type-check without emitting
```

## Project Structure

```
src/
  constants/        Shared constants (theme colors, form options)
  types/            TypeScript interfaces (quiz, lesson, course, profile)
  hooks/            Custom React hooks
  data/             Static data (quiz questions, lesson content, course catalog)
  components/
    common/         Shared UI (QuizProgressBar, FeedbackModal)
    layout/         Sidebar, DashboardHeader
    auth/           Login / Signup / Forgot Password
    dashboard/      Dashboard, CourseCard, CourseDetailView, LessonView
    quiz/           Quiz, Questions, QuizFooter, QuizResultsScreen, settings dropdown
    profile/        Profile modal, ProfileCreation wizard, DefaultStep, step configs
    admin/          AdminDashboard, ContentManager, LessonEditor
    chat/           GlobalChat
    tutorial/       TutorialPopup
  assets/           Images, videos, icons
```

## License

MIT License

## Citation

If you use Quantaid in an academic work, please cite:

> Kevin Hernandez, Tirthak Patel.  
> *Enhancing Early Quantum Computing Education with QuantumAiEd: Bridging the Educational Gap.*  
> SIGCSETS 2025: Proceedings of the 56th ACM Technical Symposium on Computer Science Education V. 2, p. 1755.  
> [https://doi.org/10.1145/3641555.3705028](https://doi.org/10.1145/3641555.3705028)  
> Published: February 18, 2025. ACM.