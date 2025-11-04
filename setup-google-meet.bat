@echo off
echo Setting up Google Meet Integration for SkillLift...
echo.

echo Creating .env file with Google credentials...
echo # Server Configuration > backend\.env
echo PORT=5000 >> backend\.env
echo NODE_ENV=development >> backend\.env
echo. >> backend\.env
echo # Database >> backend\.env
echo MONGODB_URI=mongodb://localhost:27017/skilllift >> backend\.env
echo. >> backend\.env
echo # JWT Secret >> backend\.env
echo JWT_SECRET=skilllift_jwt_secret_key_2024 >> backend\.env
echo. >> backend\.env
echo # Google OAuth Configuration >> backend\.env
echo GOOGLE_CLIENT_ID=382515835325-898906ofq2nn7i3slbvsauubf9561h07.apps.googleusercontent.com >> backend\.env
echo GOOGLE_CLIENT_SECRET=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 >> backend\.env
echo GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback >> backend\.env
echo. >> backend\.env
echo # Google API Scopes >> backend\.env
echo GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file,https://www.googleapis.com/auth/meetings.space.created >> backend\.env
echo. >> backend\.env
echo # Email Configuration >> backend\.env
echo EMAIL_USER=your_email@gmail.com >> backend\.env
echo EMAIL_PASS=your_app_password_here >> backend\.env
echo. >> backend\.env
echo # Frontend URL >> backend\.env
echo FRONTEND_URL=http://localhost:5172 >> backend\.env
echo. >> backend\.env
echo # Socket.io Configuration >> backend\.env
echo SOCKET_CORS_ORIGIN=http://localhost:5172 >> backend\.env
echo. >> backend\.env
echo # Stream.io Configuration >> backend\.env
echo STREAM_API_KEY=j86qtfj4kzaf >> backend\.env
echo STREAM_API_SECRET=your_stream_secret_here >> backend\.env

echo.
echo .env file created successfully!
echo.
echo Installing Google Meet dependencies...
cd backend
npm install googleapis google-auth-library nodemailer
echo.
echo Dependencies installed!
echo.
echo Setup complete! You can now start your servers:
echo.
echo Backend: cd backend ^&^& npm run dev
echo Frontend: cd frontend ^&^& npm run dev
echo.
pause
