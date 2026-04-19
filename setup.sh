#!/bin/bash

echo "========================================="
echo "Drug Inventory System - Setup Script"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Setup Backend
echo ""
echo "Setting up Backend..."
cd server
npm install

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env - please update with your MongoDB URI"
else
    echo "✅ .env already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "Setting up Frontend..."cd client
npm install

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env"
else
    echo "✅ .env already exists"
fi

cd ..

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Frontend:  npm start       (from client/)"
echo "2. Backend:   npm run dev     (from server/)"
echo "3. Seed DB:   npm run seed    (from server/)"
echo ""
echo "Frontend runs on: http://localhost:3000"
echo "Backend runs on:  http://localhost:5000"
echo "API docs:         http://localhost:5000/api-docs"
