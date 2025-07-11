# 🎓 AI-Powered Multimodal Classroom Assistant

An end-to-end AI solution developed under the **Intel® Unnati Program**, designed to support classroom environments with automation, accessibility, and real-time intelligence. This multimodal assistant performs facial recognition-based attendance, live transcription of speech, PDF summarization, and text-to-speech synthesis.

## 📌 Features

- ✅ **Facial Recognition for Attendance**
  - Uses a webcam feed to detect and recognize student faces.
  - Logs attendance in real time.
  - Located in `face_recognition/`.

- 🎙 **Speech-to-Text (STT)**
  - Converts real-time audio into live lecture transcripts.
  - Based on Whisper ASR.
  - Located in `stt/`.

- 🔈 **Text-to-Speech (TTS)**
  - Converts written content into spoken audio.
  - Helpful for accessibility and auditory learners.
  - Located in `tts/`.

- 📄 **PDF Summarization**
  - Summarizes lengthy PDFs into concise points.
  - Useful for revision and knowledge extraction.
  - Located in `pdf_summarization/`.

- ⚙️ **Optimized with OpenVINO**
  - All deep learning models are accelerated using OpenVINO Toolkit for real-time inference on edge devices.

## 🛠️ Tech Stack

| Component     | Technology                  |
|---------------|-----------------------------|
| Frontend      | Next.js                     |
| Backend       | Django                      |
| AI Models     | OpenVINO, Whisper, FaceNet  |
| Deployment    | Localhost / Edge Device     |

## 🚀 Running the Project

### 🔧 Backend Setup (Django)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### 🌐 Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

