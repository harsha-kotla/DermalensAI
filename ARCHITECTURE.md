# DermaLens Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                    (http://localhost:3000)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      DermaLens System                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Frontend (React + TypeScript)               │  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ ImageUpload  │  │   Results    │  │  Evolution   │  │  │
│  │  │  Component   │  │   Display    │  │    Chart     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │           API Client (Axios)                     │    │  │
│  │  │  - analyzeLesion()                               │    │  │
│  │  │  - predictEvolution()                            │    │  │
│  │  │  - healthCheck()                                 │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  Technologies: React 18, TypeScript, TailwindCSS,       │  │
│  │               Recharts, Vite, Axios                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                             │ JSON over HTTP                    │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Backend (FastAPI + PyTorch)                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │         REST API Endpoints                       │    │  │
│  │  │  • GET  /health                                  │    │  │
│  │  │  • POST /api/analyze                             │    │  │
│  │  │  • POST /api/predict-evolution                   │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                             │                             │  │
│  │                             ▼                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │      MelanomaPredictor                           │    │  │
│  │  │  - Image preprocessing (224x224)                 │    │  │
│  │  │  - Normalization (ImageNet stats)                │    │  │
│  │  │  - Model inference                               │    │  │
│  │  │  - Post-processing                               │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                             │                             │  │
│  │                             ▼                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │      MultiTaskMelanomaNet                        │    │  │
│  │  │                                                   │    │  │
│  │  │  Input: (batch, 3, 224, 224)                     │    │  │
│  │  │         │                                         │    │  │
│  │  │         ▼                                         │    │  │
│  │  │  ┌──────────────┐                                │    │  │
│  │  │  │ ResNet50     │ Pre-trained on ImageNet        │    │  │
│  │  │  │ Backbone     │ (Feature Extractor)            │    │  │
│  │  │  └──────┬───────┘                                │    │  │
│  │  │         │                                         │    │  │
│  │  │         │ Features (2048-dim)                     │    │  │
│  │  │         │                                         │    │  │
│  │  │    ┌────┴────┐                                   │    │  │
│  │  │    │         │                                   │    │  │
│  │  │    ▼         ▼                                   │    │  │
│  │  │  ┌───────┐ ┌──────────┐                         │    │  │
│  │  │  │Class. │ │  ABCDE   │                         │    │  │
│  │  │  │ Head  │ │   Head   │                         │    │  │
│  │  │  └───┬───┘ └────┬─────┘                         │    │  │
│  │  │      │          │                                │    │  │
│  │  │      ▼          ▼                                │    │  │
│  │  │  7 Classes   5 Features                         │    │  │
│  │  │  (logits)    (A,B,C,D,E)                        │    │  │
│  │  │                                                   │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  Technologies: FastAPI, PyTorch, torchvision,           │  │
│  │               Pydantic, Uvicorn, PIL, NumPy              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Image Upload Flow

```
User Interface
    ┃
    ┣━━► Select/Drag Image File
    ┃
    ┣━━► Preview Generated
    ┃
    ┣━━► Click "Analyze" or "Predict Evolution"
    ┃
    ▼
API Request
    ┃
    ┣━━► FormData with image file
    ┃
    ┣━━► POST /api/analyze or /api/predict-evolution
    ┃
    ▼
Backend Processing
    ┃
    ┣━━► 1. Validate file type & size
    ┃
    ┣━━► 2. Load image with PIL
    ┃
    ┣━━► 3. Resize to 224x224
    ┃
    ┣━━► 4. Normalize (ImageNet mean/std)
    ┃
    ┣━━► 5. Convert to tensor
    ┃
    ┣━━► 6. Add batch dimension
    ┃
    ▼
Neural Network
    ┃
    ┣━━► Forward pass through ResNet50
    ┃
    ┣━━► Extract 2048-dim features
    ┃
    ┣━━► Classification head → 7 logits
    ┃
    ┣━━► ABCDE head → 5 feature values
    ┃
    ▼
Post-Processing
    ┃
    ┣━━► Softmax on logits → probabilities
    ┃
    ┣━━► Argmax → predicted class
    ┃
    ┣━━► Sigmoid on ABCDE features → [0,1]
    ┃
    ┣━━► Calculate risk score
    ┃
    ┣━━► Generate recommendations
    ┃
    ▼
Response
    ┃
    ┣━━► JSON with results
    ┃
    ┣━━► {classification, abcde_features, risk, recommendations}
    ┃
    ▼
Frontend Display
    ┃
    ┣━━► Parse JSON response
    ┃
    ┣━━► Render results components
    ┃
    ┣━━► Show visualizations (bars, charts)
    ┃
    ┗━━► Display recommendations
```

### 2. Evolution Prediction Flow

```
Same as above until Post-Processing, then:

Evolution Logic
    ┃
    ┣━━► Get current ABCDE features
    ┃
    ┣━━► Determine progression rate (malignant vs benign)
    ┃
    ┣━━► Generate 11 timepoints (0-10)
    ┃
    ┣━━► For each timepoint:
    ┃     ┃
    ┃     ┣━━► Project features forward
    ┃     ┣━━► Calculate risk score
    ┃     ┗━━► Store point
    ┃
    ┣━━► Describe progression pattern
    ┃
    ┣━━► Identify time to concern (if any)
    ┃
    ▼
Response
    ┃
    ┣━━► Current state + Trajectory array
    ┃
    ▼
Frontend Chart
    ┃
    ┣━━► Plot with Recharts
    ┃
    ┗━━► Show progression analysis
```

## Component Architecture

### Frontend Components

```
App.tsx (Main Container)
│
├─── Header
│    └─── Logo + Title
│
├─── Main Grid (2 columns)
│    │
│    ├─── Left Column
│    │    ├─── ImageUpload Component
│    │    │    ├─── Drag & Drop Zone
│    │    │    ├─── File Input
│    │    │    └─── Preview
│    │    │
│    │    ├─── Action Buttons
│    │    │    ├─── Analyze Button
│    │    │    ├─── Predict Evolution Button
│    │    │    └─── Reset Button
│    │    │
│    │    ├─── Info Card
│    │    └─── Disclaimer
│    │
│    └─── Right Column
│         ├─── Loading State
│         ├─── Error Display
│         ├─── ResultsDisplay Component
│         │    ├─── Classification Card
│         │    ├─── ABCDE Features
│         │    └─── Recommendations
│         │
│         └─── EvolutionChart Component
│              ├─── Line Chart (Recharts)
│              ├─── Time to Concern Alert
│              └─── Statistics Grid
│
└─── Footer
```

### Backend Components

```
main.py (FastAPI App)
│
├─── Middleware
│    └─── CORS
│
├─── Endpoints
│    ├─── GET /
│    ├─── GET /health
│    ├─── POST /api/analyze
│    └─── POST /api/predict-evolution
│
├─── Exception Handlers
│
└─── Dependencies
     │
     ├─── config.py (Settings)
     │    ├─── Server config
     │    ├─── Model config
     │    ├─── CORS settings
     │    └─── Image processing
     │
     ├─── models/predictor.py
     │    ├─── MelanomaPredictor
     │    ├─── _load_model()
     │    ├─── _preprocess_image()
     │    ├─── predict()
     │    ├─── predict_evolution()
     │    └─── helper methods
     │
     ├─── models/network.py
     │    ├─── MultiTaskMelanomaNet
     │    └─── MultiTaskLoss
     │
     └─── schemas/responses.py
          ├─── ABCDEFeatures
          ├─── LesionClassification
          ├─── DiagnosisResponse
          ├─── EvolutionPoint
          └─── EvolutionResponse
```

## Neural Network Architecture

```
MultiTaskMelanomaNet
│
Input: (batch, 3, 224, 224) RGB Image
│
▼
┌────────────────────────────────────────┐
│         ResNet50 Backbone               │
│  (Pre-trained on ImageNet)              │
│                                         │
│  Conv1 → BN → ReLU → MaxPool           │
│  Layer1 (3 bottlenecks)                │
│  Layer2 (4 bottlenecks)                │
│  Layer3 (6 bottlenecks)                │
│  Layer4 (3 bottlenecks)                │
│  AvgPool                                │
└─────────────┬───────────────────────────┘
              │
              │ Features: 2048-dim
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
┌─────────┐      ┌─────────────┐
│ Class.  │      │   ABCDE     │
│  Head   │      │    Head     │
├─────────┤      ├─────────────┤
│ FC 512  │      │  FC 512     │
│ ReLU    │      │  ReLU       │
│ Drop 0.5│      │  Drop 0.5   │
│ FC 256  │      │  FC 256     │
│ ReLU    │      │  ReLU       │
│ Drop 0.3│      │  Drop 0.3   │
│ FC 7    │      │  FC 5       │
└────┬────┘      └──────┬──────┘
     │                  │
     ▼                  ▼
7 Class           5 ABCDE
Logits            Features
```

### Output Structure

```python
{
    'class_logits': Tensor[batch, 7],    # Raw logits for 7 classes
    'abcde_features': Tensor[batch, 5]   # Raw feature values
}
```

## Technology Stack Details

### Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | FastAPI 0.104 | REST API, async support |
| Deep Learning | PyTorch 2.1 | Neural network inference |
| Vision | torchvision 0.16 | Pre-trained models, transforms |
| Image Processing | PIL, OpenCV | Image loading, manipulation |
| Validation | Pydantic 2.5 | Request/response validation |
| Server | Uvicorn | ASGI server |
| Data | NumPy, Pandas | Numerical operations |

### Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18.2 | UI components |
| Language | TypeScript 5.2 | Type safety |
| Build Tool | Vite 5.0 | Fast dev server, bundling |
| Styling | TailwindCSS 3.3 | Utility-first CSS |
| Charts | Recharts 2.10 | Data visualization |
| HTTP Client | Axios 1.6 | API requests |
| Icons | Lucide React | Icon library |

### DevOps Stack

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Production web server |
| Git | Version control |

## API Specification

### Endpoints

#### GET /health
**Response:**
```json
{
  "status": "healthy",
  "message": "DermaLens API is running",
  "model_loaded": false
}
```

#### POST /api/analyze
**Request:**
- Content-Type: multipart/form-data
- Body: file (image)

**Response:**
```json
{
  "classification": {
    "class_name": "Melanocytic Nevi",
    "class_id": "nv",
    "confidence": 0.87,
    "is_malignant": false
  },
  "abcde_features": {
    "asymmetry": 0.34,
    "border_irregularity": 0.42,
    "color_variation": 0.28,
    "diameter": 4.2,
    "evolving": 0.15
  },
  "overall_risk_score": 0.23,
  "recommendations": [
    "Routine monitoring recommended",
    "Follow up if lesion changes",
    "Document with clinical photography"
  ]
}
```

#### POST /api/predict-evolution
**Request:**
- Content-Type: multipart/form-data
- Body: file (image)

**Response:**
```json
{
  "current_state": { /* ABCDEFeatures */ },
  "trajectory": [
    {
      "timepoint": 0,
      "asymmetry": 0.34,
      "border_irregularity": 0.42,
      "color_variation": 0.28,
      "diameter": 4.2,
      "risk_score": 0.23
    },
    // ... more timepoints
  ],
  "progression_pattern": "Stable benign pattern...",
  "time_to_concern": null
}
```

## Security Architecture

### Input Validation
- File type checking (MIME type)
- File extension validation
- File size limits (10MB)
- Image format verification

### CORS Policy
- Configured allowed origins
- Credentials support
- Method restrictions

### Error Handling
- Generic error messages to clients
- Detailed logging server-side
- Exception handlers for all endpoints

## Deployment Architecture

### Docker Deployment

```
┌─────────────────────────────────────┐
│         Host Machine                │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   Docker Compose Network       │ │
│  │                                 │ │
│  │  ┌──────────────────────────┐  │ │
│  │  │  Backend Container       │  │ │
│  │  │  - Python 3.10           │  │ │
│  │  │  - FastAPI app           │  │ │
│  │  │  - Port: 8000            │  │ │
│  │  │  - Volume: ./backend     │  │ │
│  │  │  - Volume: ./models      │  │ │
│  │  └──────────────────────────┘  │ │
│  │                                 │ │
│  │  ┌──────────────────────────┐  │ │
│  │  │  Frontend Container      │  │ │
│  │  │  - Nginx                 │  │ │
│  │  │  - Built React app       │  │ │
│  │  │  - Port: 3000 (→80)      │  │ │
│  │  └──────────────────────────┘  │ │
│  │                                 │ │
│  └────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
```

## Performance Considerations

### Latency
- Image preprocessing: ~50ms
- Model inference: ~100-500ms (CPU), ~20-50ms (GPU)
- Post-processing: ~10ms
- Total: ~200-600ms per request

### Throughput
- Single instance: 2-10 req/sec (CPU)
- With GPU: 20-50 req/sec
- Scalable horizontally with load balancer

### Memory
- Backend: ~500MB base + ~200MB per model
- Frontend: ~50MB built assets
- Docker: ~1.5GB total

## Future Enhancements

1. **Backend**
   - Redis caching for repeated images
   - Batch processing endpoint
   - WebSocket for real-time updates
   - Model versioning
   - A/B testing framework

2. **Frontend**
   - Progressive Web App (PWA)
   - Offline support
   - Image comparison tool
   - History/database
   - Export to PDF

3. **Infrastructure**
   - Kubernetes deployment
   - CI/CD pipeline
   - Monitoring (Prometheus/Grafana)
   - Logging (ELK stack)
   - Auto-scaling

---

**Last Updated**: 2025-10-12

