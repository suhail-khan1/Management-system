// Jasmine tests for user controller
import supertest from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../../server'; // your combined app file
import { User } from '../../user/model/user.model';

const request = supertest(app);

describe('User Management API', () => {
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    // Connect to test DB
    await mongoose.connect('mongodb://localhost:27017/management-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    // Clear users collection
    await User.deleteMany({});

    // Create an admin user for authentication
    const adminPassword = await bcrypt.hash('adminpass', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });
    await adminUser.save();

    // Login admin user to get JWT token
    const loginRes = await request.post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'adminpass',
    });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
          role: 'viewer',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User created successfully');
    });

    it('should not create user with duplicate email', async () => {
      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'duplicate',
          email: 'testuser@example.com',
          password: 'password123',
          role: 'viewer',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    it('should reject if not admin', async () => {
      // Create non-admin user
      const userPassword = await bcrypt.hash('userpass', 10);
      const user = new User({
        username: 'normaluser',
        email: 'normal@example.com',
        password: userPassword,
        role: 'viewer',
      });
      await user.save();

      const loginRes = await request.post('/api/auth/login').send({
        email: 'normal@example.com',
        password: 'userpass',
      });
      const userToken = loginRes.body.token;

      const res = await request
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          username: 'shouldfail',
          email: 'fail@example.com',
          password: 'password',
          role: 'viewer',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden: Insufficient rights');
    });
  });

  describe('GET /api/users', () => {
    it('should get list of users', async () => {
      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTrue();
      expect(res.body.length).toBeGreaterThan(0);

      userId = res.body[0]._id;
    });

    it('should reject if not admin', async () => {
      const userLoginRes = await request.post('/api/auth/login').send({
        email: 'normal@example.com',
        password: 'userpass',
      });
      const userToken = userLoginRes.body.token;

      const res = await request
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const res = await request
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(userId);
    });

    it('should return 404 for invalid id', async () => {
      const res = await request
        .get('/api/users/609c5a7c12a9e32bfc0b0000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user data', async () => {
      const res = await request
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'updateduser', role: 'editor' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
    });

    it('should not allow updating email to existing email', async () => {
      // Create another user first
      await request
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'another',
          email: 'another@example.com',
          password: 'password',
          role: 'viewer',
        });

      const res = await request
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'another@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const res = await request
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');
    });

    it('should return 404 deleting non-existent user', async () => {
      const res = await request
        .delete(`/api/users/${userId}`) // already deleted
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
