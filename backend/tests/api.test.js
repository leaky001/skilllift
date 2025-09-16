const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await User.deleteMany({});
    await Course.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new learner successfully', async () => {
      const userData = {
        name: 'Test Learner',
        email: 'learner@test.com',
        password: 'password123',
        phone: '08012345678',
        role: 'learner'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe('learner');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not allow admin registration through public API', async () => {
      const userData = {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        phone: '08012345678',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin accounts cannot be created');
    });

    it('should not register user with existing email', async () => {
      // First registration
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '08012345678',
        role: 'learner'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '08012345678',
        role: 'learner'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'password123',
        role: 'learner'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'wrongpassword',
        role: 'learner'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should fail with incorrect role', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'password123',
        role: 'tutor'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });
});

describe('Course API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create a test tutor user
    const userData = {
      name: 'Test Tutor',
      email: 'tutor@test.com',
      password: 'password123',
      phone: '08012345678',
      role: 'tutor'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    testUser = registerResponse.body.data;
    authToken = testUser.token;
  });

  describe('GET /api/courses', () => {
    it('should return empty courses list initially', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return published courses', async () => {
      // Create a published course
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        category: 'Technology',
        price: 1000,
        courseType: 'online-prerecorded',
        status: 'published',
        isApproved: true
      };

      await Course.create({
        ...courseData,
        tutor: testUser._id
      });

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe(courseData.title);
    });
  });
});
