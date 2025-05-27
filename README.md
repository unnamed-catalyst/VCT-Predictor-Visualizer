# 🧠 VCT Predictor Visualizer

⚠️ *Work in Progress* ⚠️

A full-stack application that visualizes match predictions for the **VALORANT Champions Tour (VCT)**. This tool connects a containerized **FastAPI backend** (powered by a pre-trained model) with a minimal **React.js frontend** to simulate a production-ready eSports analytics platform.

> 🔗 The data scraping and model training process are documented in a separate repo:  
> 👉 [VCT Match Predictor (Model + Scraping)](https://github.com/unnamed-catalyst/VCT-Match-Predictor)

---

## 🔧 Tech Stack

<div align="center">

| Layer       | Tools                             |
|-------------|-----------------------------------|
| **Backend** | FastAPI · Python · Docker         |
| **Frontend**| React.js · JavaScript · Vite      |
| **Hosting** | Render.com · GitHub Pages         |

</div>

---

## 📊 Data & Prediction Model

This repo builds on a previous project where I scraped and prepared real VALORANT eSports data using Selenium from [rib.gg](https://www.rib.gg/), and trained a Random Forest classifier to predict match outcomes.

📌 **Teams:** Americas, EMEA, and APAC regions (Kickoff & Stage 1 only)  
❌ **Exclusion:** VCT China teams (data not available on rib.gg)

For full details on:
- Dataset structure  
- Feature engineering  
- Training pipeline & results  
See the original project here → [VCT Match Predictor](https://github.com/unnamed-catalyst/VCT-Match-Predictor)

---

## ⚙️ System Architecture

1. **Prediction Model**  
   The trained model is served via a FastAPI backend that accepts team selections and returns win predictions.

2. **Containerized Backend**  
   The backend is Dockerized and deployed independently to handle prediction requests.

3. **Interactive Frontend**  
   The React.js frontend allows users to drag and drop teams by region and submit predictions.

4. **Decoupled Deployment**  
   The frontend and backend are hosted independently and communicate over RESTful API endpoints.

---

## 🌐 Live Demo

### 🔙 Backend API  
Hosted via [Render](https://vct-predictor-visualizer.onrender.com/docs) (sleeps after 15 minutes of inactivity).  
⏳ First request may take ~30–40s; subsequent ones are fast.

### 🔮 Frontend 
Hosted via [GitHub Pages](https://unnamed-catalyst.github.io/VCT-Predictor-Visualizer/) 
Teams are sorted by region. Drag and drop teams into the prediction zone.

---

## 💻 Running Locally

### 1. Clone this repo:
```bash
git clone https://github.com/unnamed-catalyst/VCT-Predictor-Visualizer.git
cd VCT-Predictor-Visualizer
```

### 2. Start the backend:

```bash
cd backend
docker build -t vct-api .
docker run -p 8000:8000 vct-api
```
The API will be available at http://localhost:8000.

### 3. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```
The frontend should be available at http://localhost:5173.







