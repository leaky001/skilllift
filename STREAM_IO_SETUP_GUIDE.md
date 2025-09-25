# 🔑 Stream.io API Credentials Setup Guide

## 📋 Your Stream.io Credentials
- **API Key**: `j86qtfj4kzaf`
- **API Secret**: `qknvfbg6wb9dcw3akapwc8tsj74h77axb2xsdhyd7tvgqbqyv9xyeejm5bjd4a7k`

## 🚀 Setup Instructions

### Step 1: Create Frontend .env File
Create a file named `.env` in the `frontend` directory with this content:

```env
# API Configuration
VITE_API_URL=http://localhost:3002/api

# Stream SDK Configuration
VITE_STREAM_API_KEY=j86qtfj4kzaf
VITE_STREAM_API_SECRET=qknvfbg6wb9dcw3akapwc8tsj74h77axb2xsdhyd7tvgqbqyv9xyeejm5bjd4a7k
```

### Step 2: Create Backend .env File
Create a file named `.env` in the `backend` directory with this content:

```env
# Stream.io Configuration (for Live Classes)
STREAM_API_KEY=j86qtfj4kzaf
STREAM_API_SECRET=qknvfbg6wb9dcw3akapwc8tsj74h77axb2xsdhyd7tvgqbqyv9xyeejm5bjd4a7k
```

### Step 3: Restart Servers
After creating both `.env` files:

1. **Stop the frontend server** (Ctrl+C in the terminal)
2. **Restart the frontend server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Stop the backend server** (Ctrl+C in the terminal)
4. **Restart the backend server**:
   ```bash
   cd backend
   npm start
   ```

## ✅ Verification Steps

### Test 1: Check Environment Variables
Open browser console (F12) and run:
```javascript
console.log('Stream API Key:', import.meta.env.VITE_STREAM_API_KEY);
console.log('Stream API Secret:', import.meta.env.VITE_STREAM_API_SECRET);
```

### Test 2: Test Live Class Creation
1. Login as tutor
2. Go to "Live Classes"
3. Select a course
4. Click "Start Live Class"
5. Check if Stream.io token is generated successfully

### Test 3: Test Video Call
1. Start a live class as tutor
2. Join as learner
3. Verify video call loads without errors

## 🐛 Troubleshooting

### Issue: "Stream.io token error"
**Solution**: Verify `.env` files are created correctly and servers are restarted

### Issue: "API key not found"
**Solution**: Check if environment variables are loaded:
- Frontend: Check `import.meta.env.VITE_STREAM_API_KEY`
- Backend: Check `process.env.STREAM_API_KEY`

### Issue: "Video call not loading"
**Solution**: 
1. Check browser console for errors
2. Verify Stream.io credentials are correct
3. Ensure both servers are running

## 🎯 Next Steps

After setting up the credentials:

1. **Test Basic Navigation**: Verify live class pages load
2. **Test Live Class Creation**: Create a live class as tutor
3. **Test Notifications**: Check if learners receive notifications
4. **Test Video Calls**: Join live class and test video/audio
5. **Test Recording**: End live class and check recording

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify `.env` files are in correct locations
3. Ensure servers are restarted after adding credentials
4. Test with the verification steps above

Your Stream.io credentials are now ready to use! 🎉
