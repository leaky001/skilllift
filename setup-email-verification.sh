#!/bin/bash

# Email Verification Setup Script for SkillLift
# This script helps you set up email verification

echo "📧 Setting up Email Verification for SkillLift..."
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > backend/.env << 'EOF'
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/skilllift

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3001
NODE_ENV=development

# Paystack Configuration (for payments)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Email Debug (optional)
DEBUG=email:*
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Edit backend/.env file"
echo "2. Replace 'your-email@gmail.com' with your Gmail address"
echo "3. Replace 'your-16-character-app-password' with your Gmail app password"
echo "4. Follow the Gmail setup guide below"
echo ""
echo "📧 Gmail App Password Setup:"
echo "1. Go to Google Account settings"
echo "2. Navigate to Security → 2-Step Verification"
echo "3. Click on 'App passwords'"
echo "4. Select 'Mail' and 'Other (Custom name)'"
echo "5. Enter 'SkillLift' as the name"
echo "6. Copy the generated 16-character password"
echo "7. Paste it in your .env file as EMAIL_PASS"
echo ""
echo "🧪 Test Email Verification:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Register a new account"
echo "4. Check your email for verification code"
echo "5. Enter code on verification page"
echo ""
echo "✅ Email verification setup complete!"
