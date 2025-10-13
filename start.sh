#!/bin/bash

# DermaLens Startup Script

echo "🔬 Starting DermaLens Application..."
echo ""

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker found. Starting services with Docker Compose..."
    docker-compose up -d
    echo ""
    echo "🎉 DermaLens is running!"
    echo ""
    echo "📍 Access points:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop: docker-compose down"
else
    echo "⚠️  Docker not found. Starting services manually..."
    echo ""
    
    # Start backend in background
    echo "Starting backend..."
    cd backend
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    python main.py &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    echo "Starting frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo "🎉 DermaLens is running!"
    echo ""
    echo "📍 Access points:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo ""
    echo "🛑 To stop, press Ctrl+C or run:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    
    # Wait for user interrupt
    wait
fi

