#!/bin/bash

# 🚀 SkillLift Email Setup Script
# This script helps you set up real email functionality

echo "📧 SkillLift Email Setup"
echo "========================"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found in backend/ directory"
    echo ""
    echo "🔧 Creating .env file template..."
    cat > backend/.env << EOF
# Database Configuration
MONGO_URI=mongodb://localhost:27017/skilllift

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random_123456789

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Choose ONE option below)

# Option 1: Gmail (Recommended for development)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
SENDGRID_FROM_EMAIL=noreply@skilllift.com

# Option 2: SendGrid (Recommended for production)
# EMAIL_SERVICE=sendgrid
# EMAIL_USER=apikey
# EMAIL_PASS=SG.your-sendgrid-api-key-here
# SENDGRID_FROM_EMAIL=noreply@skilllift.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=uploads

# Security Configuration
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
    echo "✅ Created backend/.env file template"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit backend/.env file with your email credentials"
    echo "2. Run: node backend/test-real-email.js"
    echo "3. See REAL_EMAIL_SETUP.md for detailed instructions"
else
    echo "✅ .env file found"
    echo ""
    echo "🧪 Testing email configuration..."
    cd backend && node test-real-email.js
fi

echo ""
echo "📖 For detailed setup instructions, see:"
echo "• REAL_EMAIL_SETUP.md"
echo "• EMAIL_SETUP_GUIDE.md"
echo "• TWILIO_EMAIL_SETUP_GUIDE.md"
echo ""
echo "🎉 Happy coding with SkillLift!"
