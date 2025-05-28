# QuantumAiEdFrontEnd

This is the frontend for QuantumAiEd, a user interface for submitting quantum education content and receiving feedback from the backend.

## 🌐 Tech Stack

- React
- TypeScript
- Vite
- CSS Modules
- Axios

## 🚀 Setup Instructions

1. Clone the repository:

   git clone https://github.com/kevvinnnh/QuantumAiEdFrontEnd.git
   cd QuantumAiEdFrontEnd/frontend

2. Install dependencies:

   npm install

3. Set up environment variables:

   cp .env.example .env

   Then open `.env` and add the following:

   VITE_BACKEND_URL=http://localhost:5000  
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here  
   VITE_PORT=5173

4. Start the development server:

   npm run dev

   The frontend will be available at http://localhost:5173

## 🔗 Connecting to Backend

Ensure the backend is running at the same URL specified in `VITE_BACKEND_URL`.

## ❗ Troubleshooting

- Make sure the backend is running on the correct port (default: 5000)
- Confirm your `.env` file contains all three keys
- Check browser console for CORS or network errors
- If Google login is used, ensure `REACT_APP_GOOGLE_CLIENT_ID` is valid

## 📄 License

MIT
