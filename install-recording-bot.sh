#!/bin/bash

echo "========================================"
echo "Installing Google Meet Recording Bot"
echo "========================================"
echo ""

cd backend

echo "Installing required packages..."
npm install puppeteer puppeteer-screen-recorder --save

echo ""
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Make sure your .env file has:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - GOOGLE_REDIRECT_URI"
echo "   - GOOGLE_SCOPES (must include https://www.googleapis.com/auth/drive.file)"
echo ""
echo "2. Connect your Google account through the app"
echo ""
echo "3. Start a live class and the bot will auto-record!"
echo ""

