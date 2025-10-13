# DermaLens Setup Guide

## Quick Start Options

### Option 1: One-Command Start (Recommended)

```bash
chmod +x start.sh
./start.sh
```

This will automatically detect Docker and start services appropriately.

---

## Detailed Setup Instructions

### Prerequisites Check

Run these commands to verify prerequisites:

```bash
# Check Python version (need 3.10+)
python --version

# Check Node.js version (need 18+)
node --version

# Check Docker (optional)
docker --version
docker-compose --version
```

---

### Setup Method 1: Docker (Easiest)

**Pros**: Consistent environment, easy deployment, no local setup needed
**Cons**: Requires Docker installation (~4GB disk space)

```bash
# 1. Navigate to project directory
cd DermaLens

# 2. Start all services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs

# 6. Stop services
docker-compose down
```

**Troubleshooting Docker:**
```bash
# Rebuild images if needed
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker-compose up -d --force-recreate
```

---

### Setup Method 2: Manual Installation

**Pros**: Direct control, faster iteration during development
**Cons**: Need to manage dependencies manually

#### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# 4. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. (Optional) Create .env file
touch .env
# Add configuration if needed

# 6. Start server
python main.py

# Or use uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Backend will be available at http://localhost:8000
```

**Backend Troubleshooting:**
```bash
# If torch installation fails, install CPU version:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# If OpenCV issues on macOS:
pip install opencv-python-headless

# Check if server is running:
curl http://localhost:8000/health
```

#### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. (Optional) Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 4. Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

**Frontend Troubleshooting:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# If port 3000 is busy, edit vite.config.ts to change port

# Type check without running:
npx tsc --noEmit
```

---

### Setup Method 3: Development Mode

For active development with hot-reload:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Adding a Trained Model

The application runs in demo mode by default. To use a real model:

1. **Obtain or train a model** with the `MultiTaskMelanomaNet` architecture
2. **Save checkpoint** in PyTorch format:
   ```python
   checkpoint = {
       'model_state_dict': model.state_dict(),
       'epoch': epoch,
       'loss': loss,
   }
   torch.save(checkpoint, 'melanoma_classifier.pth')
   ```
3. **Place file** at `backend/models/melanoma_classifier.pth`
4. **Restart** backend service

---

## Verification Checklist

After setup, verify everything works:

- [ ] Backend health check: http://localhost:8000/health
- [ ] API documentation loads: http://localhost:8000/docs
- [ ] Frontend loads: http://localhost:3000
- [ ] Can upload an image in the UI
- [ ] Analysis returns results (demo predictions if no model)
- [ ] Evolution prediction works

---

## Common Issues

### Issue: "Port already in use"

**Solution:**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or for port 3000
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: "CORS errors in browser console"

**Solution:**
1. Verify backend is running
2. Check `ALLOWED_ORIGINS` in `backend/config.py` includes `http://localhost:3000`
3. Restart backend after changes

### Issue: "Module not found" errors

**Backend Solution:**
```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

**Frontend Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Model failed to load"

This is expected if you don't have a trained model. The app will run in demo mode. Check logs:
```bash
# Docker:
docker-compose logs backend | grep -i model

# Manual:
# Check terminal where backend is running
```

---

## Production Deployment

### Using Docker (Recommended)

```bash
# 1. Build production images
docker-compose build

# 2. Update docker-compose.yml:
#    - Set DEBUG=false
#    - Update ALLOWED_ORIGINS
#    - Configure proper domains

# 3. Deploy with restart policy
docker-compose up -d

# 4. Set up reverse proxy (nginx/traefik) for HTTPS
```

### Manual Production

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ with nginx or similar
```

---

## Next Steps

1. **Upload test images** to verify the system works
2. **Review API docs** at http://localhost:8000/docs
3. **Customize settings** in `backend/config.py`
4. **Train or load a model** for real predictions
5. **Read the main README.md** for architecture details

---

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review [backend/models/README.md](backend/models/README.md) for model info
- Open an issue on GitHub for bugs or questions

---

**Happy analyzing! 🔬**

