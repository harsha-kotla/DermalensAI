#!/bin/bash

# DermaLens Setup Verification Script

echo "🔬 DermaLens Setup Verification"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
PASSED=0
FAILED=0

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

# 1. Check Python
echo "📦 Checking Prerequisites..."
python3 --version > /dev/null 2>&1
check $? "Python 3 installed"

# 2. Check Node.js
node --version > /dev/null 2>&1
check $? "Node.js installed"

# 3. Check Docker (optional)
docker --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Docker installed (optional)"
else
    echo -e "${YELLOW}!${NC} Docker not found (optional)"
fi

echo ""
echo "📁 Checking Project Structure..."

# Backend files
[ -f "backend/main.py" ]
check $? "backend/main.py exists"

[ -f "backend/config.py" ]
check $? "backend/config.py exists"

[ -f "backend/requirements.txt" ]
check $? "backend/requirements.txt exists"

[ -f "backend/models/network.py" ]
check $? "backend/models/network.py exists"

[ -f "backend/models/predictor.py" ]
check $? "backend/models/predictor.py exists"

[ -f "backend/Dockerfile" ]
check $? "backend/Dockerfile exists"

# Frontend files
[ -f "frontend/package.json" ]
check $? "frontend/package.json exists"

[ -f "frontend/src/App.tsx" ]
check $? "frontend/src/App.tsx exists"

[ -f "frontend/src/components/ImageUpload.tsx" ]
check $? "frontend/src/components/ImageUpload.tsx exists"

[ -f "frontend/src/components/ResultsDisplay.tsx" ]
check $? "frontend/src/components/ResultsDisplay.tsx exists"

[ -f "frontend/src/components/EvolutionChart.tsx" ]
check $? "frontend/src/components/EvolutionChart.tsx exists"

[ -f "frontend/Dockerfile" ]
check $? "frontend/Dockerfile exists"

# Configuration files
[ -f "docker-compose.yml" ]
check $? "docker-compose.yml exists"

[ -f "README.md" ]
check $? "README.md exists"

[ -f "SETUP_GUIDE.md" ]
check $? "SETUP_GUIDE.md exists"

[ -f ".gitignore" ]
check $? ".gitignore exists"

echo ""
echo "🔍 Checking File Content..."

# Check if backend main.py has required imports
grep -q "from fastapi import FastAPI" backend/main.py
check $? "backend/main.py has FastAPI import"

# Check if frontend package.json has required deps
grep -q '"react"' frontend/package.json
check $? "frontend/package.json has React dependency"

grep -q '"typescript"' frontend/package.json
check $? "frontend/package.json has TypeScript dependency"

# Check if docker-compose has both services
grep -q "backend:" docker-compose.yml
check $? "docker-compose.yml has backend service"

grep -q "frontend:" docker-compose.yml
check $? "docker-compose.yml has frontend service"

echo ""
echo "================================"
echo -e "Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Setup is complete.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run './start.sh' to start the application"
    echo "  2. Or run 'docker-compose up -d' for Docker"
    echo "  3. Or follow SETUP_GUIDE.md for manual setup"
    echo ""
    echo "Access points:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
else
    echo -e "${RED}❌ Some checks failed. Please review the output above.${NC}"
    exit 1
fi

