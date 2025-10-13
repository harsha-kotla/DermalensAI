# DermaLens 🔬

**AI-Powered Melanoma Detection & Evolution Prediction System**

DermaLens is an advanced deep learning application for automated skin lesion analysis, featuring multi-task melanoma detection and evolution trajectory prediction. Built with state-of-the-art computer vision and a modern web interface.

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-18.2+-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

### Core Capabilities
- **Multi-Class Classification**: 7 skin lesion types (HAM10000 dataset)
- **ABCDE Feature Extraction**: Automated analysis of clinical features
  - Asymmetry
  - Border irregularity
  - Color variation
  - Diameter estimation
  - Evolution scoring
- **Risk Assessment**: Comprehensive malignancy risk scoring
- **Evolution Prediction**: Temporal trajectory forecasting in latent space
- **Clinical Recommendations**: AI-generated actionable insights

### Technical Highlights
- **Multi-Task Learning**: Shared ResNet50 backbone with dual task heads
- **Real-time Analysis**: Sub-second inference on CPU/GPU
- **Modern UI**: Beautiful, responsive React + TypeScript frontend
- **Production Ready**: Docker containerization with health checks
- **RESTful API**: FastAPI backend with automatic OpenAPI docs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  DermaLens System                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Frontend (React + TypeScript)                      │
│  ├─ Image Upload Component                          │
│  ├─ Results Visualization                           │
│  ├─ Evolution Charts (Recharts)                     │
│  └─ Responsive UI (TailwindCSS)                     │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Backend (FastAPI + PyTorch)                        │
│  ├─ REST API Endpoints                              │
│  ├─ Image Preprocessing                             │
│  ├─ Multi-Task Neural Network                       │
│  │   ├─ ResNet50 Backbone                           │
│  │   ├─ Classification Head (7 classes)             │
│  │   └─ ABCDE Feature Head (5 features)             │
│  └─ Evolution Predictor                             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional)
- CUDA-capable GPU (optional, for faster inference)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd DermaLens

# Start services with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
cp .env.example .env

# Run the server
python main.py
# Or with uvicorn:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
DermaLens/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── models/
│   │   ├── network.py         # Neural network architecture
│   │   └── predictor.py       # Inference logic
│   ├── schemas/
│   │   └── responses.py       # Pydantic models
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   └── EvolutionChart.tsx
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   ├── types/
│   │   │   └── api.ts         # TypeScript types
│   │   ├── App.tsx            # Main application
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔬 Model Architecture

### Multi-Task Melanoma Network

The system uses a multi-task learning approach with a shared ResNet50 backbone:

1. **Backbone**: Pre-trained ResNet50 (ImageNet)
2. **Classification Head**: 
   - FC(2048 → 512) → ReLU → Dropout(0.5)
   - FC(512 → 256) → ReLU → Dropout(0.3)
   - FC(256 → 7)
3. **ABCDE Feature Head**:
   - FC(2048 → 512) → ReLU → Dropout(0.5)
   - FC(512 → 256) → ReLU → Dropout(0.3)
   - FC(256 → 5)

**Loss Function**: Weighted combination of CrossEntropy (classification) and MSE (feature regression)

### Supported Classes

Based on HAM10000 dataset:
- `akiec`: Actinic Keratoses
- `bcc`: Basal Cell Carcinoma (malignant)
- `bkl`: Benign Keratosis
- `df`: Dermatofibroma
- `mel`: Melanoma (malignant)
- `nv`: Melanocytic Nevi
- `vasc`: Vascular Lesions

## 📊 API Endpoints

### `GET /health`
Health check endpoint
- Returns: API status and model load status

### `POST /api/analyze`
Analyze skin lesion image
- Input: Image file (JPG/PNG, max 10MB)
- Returns: Classification, ABCDE features, risk score, recommendations

### `POST /api/predict-evolution`
Predict lesion evolution trajectory
- Input: Image file (JPG/PNG, max 10MB)
- Returns: Current state, trajectory points, progression pattern

## 🎨 Frontend Features

### Components

1. **ImageUpload**: Drag-and-drop image uploader with preview
2. **ResultsDisplay**: 
   - Classification with confidence scores
   - ABCDE feature visualization
   - Risk assessment indicators
   - Clinical recommendations
3. **EvolutionChart**: Interactive trajectory visualization using Recharts

### Technologies

- React 18.2 with TypeScript
- Vite for fast builds
- TailwindCSS for styling
- Recharts for data visualization
- Axios for API communication
- Lucide React for icons

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env` or `backend/config.py`:

```python
HOST = "0.0.0.0"
PORT = 8000
DEBUG = True

MODEL_PATH = "./models/melanoma_classifier.pth"
CONFIDENCE_THRESHOLD = 0.5

ALLOWED_ORIGINS = ["http://localhost:3000"]

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]
IMAGE_SIZE = (224, 224)
```

### Frontend Configuration

Edit `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 🧪 Demo Mode

The application runs in **demo mode** when no trained model is found. It generates simulated predictions for demonstration purposes. To use a real model:

1. Train your model or obtain a pre-trained checkpoint
2. Place it at `backend/models/melanoma_classifier.pth`
3. Restart the backend server

## 📝 Development

### Backend Development

```bash
cd backend

# Install in development mode
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Access interactive API docs
# http://localhost:8000/docs
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Scale services
docker-compose up -d --scale backend=2
```

## 🔍 Testing

### Backend Testing

```bash
cd backend

# Test health endpoint
curl http://localhost:8000/health

# Test analyze endpoint
curl -X POST "http://localhost:8000/api/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

### Frontend Testing

```bash
cd frontend

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## ⚠️ Medical Disclaimer

**IMPORTANT**: This application is for educational and research purposes only. It is NOT a medical device and should NOT be used for clinical diagnosis or treatment decisions. Always consult with qualified healthcare professionals for medical advice.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- HAM10000 Dataset for training data
- PyTorch and torchvision teams
- FastAPI framework
- React and Vite communities
- All open-source contributors

---

**Built with ❤️ for advancing dermatological AI research**

