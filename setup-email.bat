@echo off
REM 🚀 SkillLift Email Setup Script for Windows
REM This script helps you set up real email functionality

echo 📧 SkillLift Email Setup
echo ========================
echo.

REM Check if .env file exists
if not exist "backend\.env" (
    echo ❌ .env file not found in backend\ directory
    echo.
    echo 🔧 Creating .env file template...
    
    (
    echo # Database Configuration
    echo MONGO_URI=mongodb://localhost:27017/skilllift
    echo.
    echo # JWT Configuration
    echo JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random_123456789
    echo.
    echo # Server Configuration
    echo PORT=5000
    echo NODE_ENV=development
    echo.
    echo # Email Configuration ^(Choose ONE option below^)
    echo.
    echo # Option 1: Gmail ^(Recommended for development^)
    echo EMAIL_SERVICE=gmail
    echo EMAIL_USER=your-email@gmail.com
    echo EMAIL_PASS=your-16-character-app-password
    echo SENDGRID_FROM_EMAIL=noreply@skilllift.com
    echo.
    echo # Option 2: SendGrid ^(Recommended for production^)
    echo # EMAIL_SERVICE=sendgrid
    echo # EMAIL_USER=apikey
    echo # EMAIL_PASS=SG.your-sendgrid-api-key-here
    echo # SENDGRID_FROM_EMAIL=noreply@skilllift.com
    echo.
    echo # Frontend URL
    echo FRONTEND_URL=http://localhost:3000
    echo.
    echo # Cloudinary Configuration ^(Optional^)
    echo CLOUDINARY_CLOUD_NAME=your_cloud_name
    echo CLOUDINARY_API_KEY=your_api_key
    echo CLOUDINARY_API_SECRET=your_api_secret
    echo.
    echo # Paystack Configuration
    echo PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
    echo PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
    echo.
    echo # File Upload Configuration
    echo MAX_FILE_SIZE=104857600
    echo UPLOAD_PATH=uploads
    echo.
    echo # Security Configuration
    echo CORS_ORIGIN=http://localhost:5173
    echo RATE_LIMIT_WINDOW_MS=900000
    echo RATE_LIMIT_MAX_REQUESTS=1000
    ) > backend\.env
    
    echo ✅ Created backend\.env file template
    echo.
    echo 📝 Next steps:
    echo 1. Edit backend\.env file with your email credentials
    echo 2. Run: node backend\test-real-email.js
    echo 3. See REAL_EMAIL_SETUP.md for detailed instructions
) else (
    echo ✅ .env file found
    echo.
    echo 🧪 Testing email configuration...
    cd backend && node test-real-email.js
)

echo.
echo 📖 For detailed setup instructions, see:
echo • REAL_EMAIL_SETUP.md
echo • EMAIL_SETUP_GUIDE.md
echo • TWILIO_EMAIL_SETUP_GUIDE.md
echo.
echo 🎉 Happy coding with SkillLift!
pause
