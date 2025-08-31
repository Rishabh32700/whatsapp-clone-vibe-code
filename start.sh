#!/bin/bash

echo "🚀 Starting WhatsApp Clone with Backend API..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   mongod"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

# Start backend server
echo "🔧 Starting Backend API Server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "📱 Starting Frontend Development Server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5001/api"
echo "🔌 Socket.io: ws://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup on exit
echo ""
echo "🛑 Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "✅ Servers stopped"
