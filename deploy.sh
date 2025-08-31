#!/bin/bash

echo "🚀 WhatsApp Clone Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo "   git push -u origin main"
    exit 1
fi

echo "✅ Git repository configured"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please update .env file with your production URLs"
fi

# Check if server/config.env exists
if [ ! -f "server/config.env" ]; then
    echo "⚠️  server/config.env not found. Creating template..."
    cat > server/config.env << EOF
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-clone?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
EOF
    echo "📝 Please update server/config.env with your production values"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🗄️  Set up MongoDB Atlas:"
echo "   - Go to https://www.mongodb.com/atlas"
echo "   - Create free cluster"
echo "   - Get connection string"
echo "   - Update server/config.env"
echo ""
echo "2. 🔧 Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect GitHub repository"
echo "   - Set environment variables"
echo "   - Deploy"
echo ""
echo "3. 🎨 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect GitHub repository"
echo "   - Set environment variables"
echo "   - Deploy"
echo ""
echo "4. 🔗 Update URLs:"
echo "   - Update .env with backend URL"
echo "   - Update server/config.env with frontend URL"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "�� Happy deploying!"
