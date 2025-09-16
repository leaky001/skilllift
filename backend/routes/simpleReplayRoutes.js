const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/replays';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `replay-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});

// Simple replay storage (in-memory for demo)
let replays = [];
let notifications = [];

// Load existing replays from file if it exists
const replaysFile = path.join(__dirname, '../data/replays.json');
if (fs.existsSync(replaysFile)) {
  try {
    const data = fs.readFileSync(replaysFile, 'utf8');
    replays = JSON.parse(data);
  } catch (error) {
    console.error('Error loading replays:', error);
    replays = [];
  }
}

// Save replays to file
const saveReplays = () => {
  try {
    const dataDir = path.dirname(replaysFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(replaysFile, JSON.stringify(replays, null, 2));
  } catch (error) {
    console.error('Error saving replays:', error);
  }
};

// Upload replay - simplified version
router.post('/upload', upload.single('replayFile'), async (req, res) => {
  try {
    const { courseId, topic, tutorId } = req.body;
    const replayFile = req.file;

    if (!courseId || !topic || !replayFile) {
      return res.status(400).json({
        success: false,
        message: 'Course, topic, and video file are required'
      });
    }

    // Create simple replay record
    const replay = {
      _id: `replay_${Date.now()}`,
      courseId,
      topic,
      tutorId,
      courseTitle: 'Web Development Fundamentals', // This should come from course lookup
      tutorName: 'John Doe', // This should come from tutor lookup
      fileName: replayFile.filename,
      originalName: replayFile.originalname,
      filePath: replayFile.path,
      fileSize: replayFile.size,
      uploadDate: new Date(),
      status: 'ready',
      views: 0,
      duration: '1h 30m', // Default duration
      description: `Replay for ${topic}`
    };

    replays.push(replay);
    
    // Save to file
    saveReplays();

    // Create notifications for enrolled students
    // In a real app, you'd fetch enrolled students from database
    const enrolledStudents = [
      { _id: 'student1', name: 'Alice Johnson', email: 'alice@example.com' },
      { _id: 'student2', name: 'Bob Smith', email: 'bob@example.com' },
      { _id: 'student3', name: 'Carol Davis', email: 'carol@example.com' }
    ];

    enrolledStudents.forEach(student => {
      notifications.push({
        _id: `notif_${Date.now()}_${student._id}`,
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        type: 'replay_uploaded',
        title: 'New Class Replay Available',
        message: `A new replay for "${topic}" has been uploaded to your course.`,
        courseId,
        replayId: replay._id,
        createdAt: new Date(),
        read: false
      });
    });

    console.log('✅ Replay uploaded successfully:', {
      id: replay._id,
      topic: replay.topic,
      courseId: replay.courseId,
      fileName: replay.fileName,
      studentsNotified: enrolledStudents.length
    });

    res.json({
      success: true,
      data: {
        replay,
        studentsNotified: enrolledStudents.length
      },
      message: 'Replay uploaded successfully! Students have been notified.'
    });

  } catch (error) {
    console.error('Error uploading replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload replay',
      error: error.message
    });
  }
});

// Get replays for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // In a real app, you'd filter by enrolled courses
    const studentReplays = replays.map(replay => ({
      ...replay,
      courseTitle: 'Web Development Fundamentals', // Mock data
      tutorName: 'John Doe', // Mock data
      duration: '1h 30m', // Mock data
      thumbnail: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Replay'
    }));

    res.json({
      success: true,
      data: studentReplays,
      message: 'Replays retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching replays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replays',
      error: error.message
    });
  }
});

// Get notifications for a student
router.get('/notifications/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentNotifications = notifications.filter(notif => 
      notif.studentId === studentId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: studentNotifications,
      message: 'Notifications retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = notifications.find(notif => notif._id === notificationId);
    if (notification) {
      notification.read = true;
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    });
  }
});

// Get replay file for streaming/download
router.get('/stream/:replayId', async (req, res) => {
  try {
    const { replayId } = req.params;

    const replay = replays.find(r => r._id === replayId);
    if (!replay) {
      return res.status(404).json({
        success: false,
        message: 'Replay not found'
      });
    }

    // Increment view count
    replay.views += 1;

    // In a real app, you'd stream the file properly
    res.json({
      success: true,
      data: {
        filePath: replay.filePath,
        fileName: replay.originalName,
        fileSize: replay.fileSize
      },
      message: 'Replay file ready'
    });

  } catch (error) {
    console.error('Error streaming replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stream replay',
      error: error.message
    });
  }
});

module.exports = router;
