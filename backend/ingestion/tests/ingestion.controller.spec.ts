import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import ingestionRoutes from '../routes/ingestion.routes';
import { Ingestion } from '../model/ingestion.model';
import jwt from 'jsonwebtoken';

// Setup express app
const app = express();
app.use(express.json());

// Setup auth middleware directly
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'test_secret');
      (req as any).user = decoded;
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }
  next();
});

app.use('/api/ingestions', ingestionRoutes);

describe('Ingestion Management API', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

  beforeAll(async (done) => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    token = jwt.sign({ id: 'testUser', role: 'admin' }, 'test_secret');
    done();
  });

  afterAll(async (done) => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    done();
  });

  afterEach(async (done) => {
    await Ingestion.deleteMany({});
    done();
  });

  it('should create a new ingestion job', async (done) => {
    const res = await request(app)
      .post('/api/ingestions')
      .set('Authorization', `Bearer ${token}`)
      .send({ sourceType: 'file.csv' });

    expect(res.status).toBe(201);
    expect(res.body.ingestion).toBeDefined();
    expect(res.body.ingestion.sourceType).toBe('file.csv');
    expect(res.body.ingestion.status).toBe('pending');
    done();
  });

  it('should return all ingestion jobs', async (done) => {
    await Ingestion.create({ sourceType: 'a.csv' });
    await Ingestion.create({ sourceType: 'b.csv' });

    const res = await request(app)
      .get('/api/ingestions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    done();
  });

  it('should return ingestion job by ID', async (done) => {
    const job = await Ingestion.create({ sourceType: 'data.csv' });

    const res = await request(app)
      .get(`/api/ingestions/${job._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.sourceType).toBe('data.csv');
    done();
  });

  it('should update ingestion status and logs', async (done) => {
    const job = await Ingestion.create({ sourceType: 'update.csv' });

    const res = await request(app)
      .put(`/api/ingestions/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed', logs: ['Job finished.'] });

    expect(res.status).toBe(200);
    expect(res.body.ingestion.status).toBe('completed');
    expect(res.body.ingestion.logs).toContain('Job finished.');
    done();
  });

  it('should delete an ingestion job', async (done) => {
    const job = await Ingestion.create({ sourceType: 'delete.csv' });

    const res = await request(app)
      .delete(`/api/ingestions/${job._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Ingestion job deleted');
    done();
  });

  it('should return 404 for non-existent ingestion', async (done) => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/ingestions/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    done();
  });

  it('should return 400 when required fields are missing', async (done) => {
    const res = await request(app)
      .post('/api/ingestions')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    done();
  });
});
