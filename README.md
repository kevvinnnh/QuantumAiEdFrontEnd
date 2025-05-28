# QuantumAiEdFrontEnd

QuantumAiEd is an AI-powered platform designed to bridge the educational gap in early quantum computing instruction. This repository contains the frontend interface, built with React and TypeScript, which communicates with the backend to deliver personalized feedback and adaptive learning experiences.

---

## 🌍 Live Demo

Access the deployed app here:  
🔗 **[https://quantum-ai-ed-front-end-smoky.vercel.app/](https://quantum-ai-ed-front-end-smoky.vercel.app/)**

---

## 🧰 Tech Stack

- **Framework**: React + Vite + TypeScript  
- **Styling**: CSS Modules  
- **Networking**: Axios  
- **Environment Management**: Vite `.env` variables

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/kevvinnnh/QuantumAiEdFrontEnd.git
cd QuantumAiEdFrontEnd/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then open `.env` and fill in the following keys:

```
VITE_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
VITE_PORT=5173
```

### 4. Start the Development Server

```bash
npm run dev
```

By default, the frontend runs at:  
📍 `http://localhost:5173`

---

## 🔗 Backend Connection

This app communicates with the Flask-based backend at the URL defined in `VITE_BACKEND_URL`. Be sure the backend is running locally on port `5000` or update the value accordingly.

---

## 🧪 Troubleshooting

- ❌ **API request failures**: Ensure the backend is running and `VITE_BACKEND_URL` is correct.
- ⚠️ **CORS issues**: Confirm backend CORS settings allow `localhost:5173`.
- 🛑 **Missing environment variables**: Double-check your `.env` file for typos or missing values.
- 🔍 **Console errors**: Use browser developer tools for debugging UI issues.

---

## 📄 License

MIT License

---

## 📝 Citation

If you use QuantumAiEd in academic work, please cite:

> Kevin Hernandez, Tirthak Patel.  
> *Enhancing Early Quantum Computing Education with QuantumAiEd: Bridging the Educational Gap.*  
> SIGCSETS 2025: Proceedings of the 56th ACM Technical Symposium on Computer Science Education V. 2, p. 1755.  
> [https://doi.org/10.1145/3641555.3705028](https://doi.org/10.1145/3641555.3705028)  
> Published: February 18, 2025. ACM.
