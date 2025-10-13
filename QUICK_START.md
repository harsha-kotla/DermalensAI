# DermaLens - Quick Start ⚡

## TL;DR - Get Running in 60 Seconds

### Option 1: Automatic Start (Easiest)
```bash
./start.sh
```

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: Manual
```bash
# Terminal 1 - Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python main.py

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

## Access the App
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## Usage Flow
1. Open http://localhost:3000
2. Upload a skin lesion image (JPG/PNG)
3. Click **"Analyze Lesion"** for classification OR
4. Click **"Predict Evolution"** for trajectory
5. Review results and recommendations

## Quick Commands

### Start Services
```bash
./start.sh                    # Auto-detect and start
docker-compose up -d          # Docker
```

### Stop Services
```bash
docker-compose down           # Docker
# Or Ctrl+C if running manually
```

### View Logs
```bash
docker-compose logs -f        # All services
docker-compose logs backend   # Backend only
docker-compose logs frontend  # Frontend only
```

### Restart
```bash
docker-compose restart        # Restart all
docker-compose restart backend  # Restart backend only
```

### Check Status
```bash
curl http://localhost:8000/health
./verify.sh
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Fresh Start
```bash
# Docker
docker-compose down -v
docker-compose up -d --force-recreate

# Manual
rm -rf backend/venv frontend/node_modules
# Then reinstall
```

### Check if Running
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

## Demo Mode

⚠️ **Note**: The app runs in demo mode (simulated predictions) until you add a trained model at `backend/models/melanoma_classifier.pth`

## File Overview

```
DermaLens/
├── 🚀 start.sh              # One-command start
├── ✅ verify.sh             # Verify setup
├── 🐳 docker-compose.yml    # Docker config
├── 📖 README.md             # Full docs
├── 📋 SETUP_GUIDE.md        # Detailed setup
├── 📝 PROJECT_SUMMARY.md    # Complete overview
├── ⚡ QUICK_START.md        # This file
├── backend/                 # Python API
└── frontend/                # React UI
```

## Need Help?

1. Run `./verify.sh` to check setup
2. Check `SETUP_GUIDE.md` for detailed instructions
3. See `README.md` for full documentation
4. Review `PROJECT_SUMMARY.md` for architecture

## Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check backend is running on port 8000 |
| Can't upload images | Check file size (<10MB) and format (JPG/PNG) |
| No results | Check browser console and backend logs |
| Port conflict | Kill process or change port in config |
| Module not found | Reinstall dependencies |

## Production Deployment

For production, update these settings:
- Set `DEBUG=false` in backend
- Update `ALLOWED_ORIGINS` with your domain
- Use HTTPS/TLS
- Set up proper secrets management
- Enable rate limiting
- Configure monitoring

## What You Can Do

✅ Upload skin lesion images
✅ Get AI-powered classification (7 lesion types)
✅ View ABCDE feature analysis
✅ See risk scores and recommendations
✅ Predict evolution trajectories
✅ View interactive charts
✅ Export/save results (coming soon)

## Medical Disclaimer

⚠️ This is a research tool, NOT for medical diagnosis. Always consult healthcare professionals.

---

**Ready to start?** Run `./start.sh` and visit http://localhost:3000

🔬 **Happy analyzing!**

