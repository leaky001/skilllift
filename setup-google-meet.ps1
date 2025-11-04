Write-Host "Setting up Google Meet Integration for SkillLift..." -ForegroundColor Green
Write-Host ""

Write-Host "Creating .env file with Google credentials..." -ForegroundColor Yellow

# Create .env file content
$envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/skilllift

# JWT Secret
JWT_SECRET=skilllift_jwt_secret_key_2024

# Google OAuth Configuration
GOOGLE_CLIENT_ID=382515835325-898906ofq2nn7i3slbvsauubf9561h07.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback

# Google API Scopes
GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file,https://www.googleapis.com/auth/meetings.space.created

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Frontend URL
FRONTEND_URL=http://localhost:5172

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:5172

# Stream.io Configuration
STREAM_API_KEY=j86qtfj4kzaf
STREAM_API_SECRET=your_stream_secret_here
"@

# Write to .env file
$envContent | Out-File -FilePath "backend\.env" -Encoding UTF8

Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Installing Google Meet dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install googleapis google-auth-library nodemailer

Write-Host ""
Write-Host "Dependencies installed!" -ForegroundColor Green
Write-Host ""

Write-Host "Setup complete! You can now start your servers:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: cd backend; npm run dev" -ForegroundColor White
Write-Host "Frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
