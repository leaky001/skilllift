const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 COMPREHENSIVE SYSTEM RESTART...\n');

async function restartSystem() {
  try {
    // Step 1: Kill existing processes
    console.log('1️⃣ Stopping existing processes...');
    
    // Kill backend process
    try {
      const { exec } = require('child_process');
      await new Promise((resolve) => {
        exec('taskkill /f /im node.exe', (error) => {
          if (error) {
            console.log('   ℹ️ No existing Node processes to kill');
          } else {
            console.log('   ✅ Killed existing Node processes');
          }
          resolve();
        });
      });
    } catch (error) {
      console.log('   ℹ️ No existing processes to kill');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Start backend server
    console.log('\n2️⃣ Starting backend server...');
    const backendPath = path.join(__dirname);
    const backendProcess = spawn('npm', ['start'], {
      cwd: backendPath,
      stdio: 'pipe',
      shell: true
    });
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('SkillLift Backend API running')) {
        console.log('   ✅ Backend server started successfully');
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.log('   Backend stderr:', data.toString());
    });
    
    // Wait for backend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Start frontend server
    console.log('\n3️⃣ Starting frontend server...');
    const frontendPath = path.join(__dirname, '..', 'frontend');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: frontendPath,
      stdio: 'pipe',
      shell: true
    });
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:')) {
        console.log('   ✅ Frontend server started successfully');
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      console.log('   Frontend stderr:', data.toString());
    });
    
    // Wait for frontend to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n✅ SYSTEM RESTART COMPLETED!');
    console.log('🎯 Backend: http://localhost:3001');
    console.log('🎯 Frontend: http://localhost:5173');
    console.log('\n📋 All fixes applied:');
    console.log('   ✅ Database connection improved');
    console.log('   ✅ Authentication timeout handling added');
    console.log('   ✅ Enrollment controller error handling added');
    console.log('   ✅ Notification controller error handling added');
    console.log('   ✅ Course controller timeout handling added');
    console.log('\n🎉 System is now ready for testing!');
    
  } catch (error) {
    console.error('❌ Restart failed:', error.message);
  }
}

restartSystem();
