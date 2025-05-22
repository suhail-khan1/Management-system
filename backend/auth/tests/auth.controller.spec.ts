// Jasmine tests for auth controller
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import { User } from '../../user/model/user.model';

describe('Authentication API', () => {
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth_microservice_test';
    await mongoose.connect(mongoURI);
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'viewer'
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(userData);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not register user with existing email', async () => {
    const res = await request(app).post('/api/auth/register').send(userData);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already registered');
  });

  it('should fail registration on missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad@bad.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing required fields');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: 'wrongpassword'
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should not login non-existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noone@nowhere.com',
      password: 'password123'
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should get user profile with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password
    });

    const token = loginRes.body.token;
    const profileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe(userData.email);
    expect(profileRes.body.password).toBeUndefined(); // no password in response
  });

  it('should fail profile request with no token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization header missing');
  });

  it('should fail profile request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});
