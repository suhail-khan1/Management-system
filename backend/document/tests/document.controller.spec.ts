// Jasmine tests for document controller
import supertest from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import app from '../../server'; // your combined app file
import { DocumentModel } from '../../document/model/document.model';
import { User } from '../../user/model/user.model';
import bcrypt from 'bcryptjs';

const request = supertest(app);

describe('Document Management API', () => {
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let documentId: string;

  beforeAll(async () => {
    // Connect to test DB
    await mongoose.connect('mongodb://localhost:27017/management-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    // Clean users and documents collections
    await User.deleteMany({});
    await DocumentModel.deleteMany({});

    // Create users with different roles
    const passwordHash = await bcrypt.hash('password', 10);
    const adminUser = new User({ username: 'admin', email: 'admin@example.com', password: passwordHash, role: 'admin' });
    const editorUser = new User({ username: 'editor', email: 'editor@example.com', password: passwordHash, role: 'editor' });
    const viewerUser = new User({ username: 'viewer', email: 'viewer@example.com', password: passwordHash, role: 'viewer' });

    await adminUser.save();
    await editorUser.save();
    await viewerUser.save();

    // Login all users
    const adminLogin = await request.post('/api/auth/login').send({ email: 'admin@example.com', password: 'password' });
    adminToken = adminLogin.body.token;

    const editorLogin = await request.post('/api/auth/login').send({ email: 'editor@example.com', password: 'password' });
    editorToken = editorLogin.body.token;

    const viewerLogin = await request.post('/api/auth/login').send({ email: 'viewer@example.com', password: 'password' });
    viewerToken = viewerLogin.body.token;
  });

  afterAll(async () => {
    // Clean up uploaded files
    const docs = await DocumentModel.find();
    docs.forEach((doc: any) => {
      if (doc.filePath && fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath);
      }
    });

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/documents', () => {
    it('should allow admin to upload a document', async () => {
      const res = await request.post('/api/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Test Document')
        .attach('file', path.join(__dirname, '../test-files/test.pdf'));

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Document uploaded successfully');
      expect(res.body.document.title).toBe('Test Document');
      documentId = res.body.document._id;
    });

    it('should allow editor to upload a document', async () => {
      const res = await request.post('/api/documents')
        .set('Authorization', `Bearer ${editorToken}`)
        .field('title', 'Editor Doc')
        .attach('file', path.join(__dirname, '../test-files/test.pdf'));

      expect(res.status).toBe(201);
      expect(res.body.document.title).toBe('Editor Doc');
    });

    it('should not allow viewer to upload a document', async () => {
      const res = await request.post('/api/documents')
        .set('Authorization', `Bearer ${viewerToken}`)
        .field('title', 'Viewer Doc')
        .attach('file', path.join(__dirname, '../test-files/test.pdf'));

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden: Insufficient rights');
    });

    it('should reject if no file uploaded', async () => {
      const res = await request.post('/api/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'No File');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Document file is required');
    });

    it('should reject if no title', async () => {
      const res = await request.post('/api/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', path.join(__dirname, '../test-files/test.pdf'));

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('GET /api/documents', () => {
    it('should allow any authenticated user to list documents', async () => {
      const resAdmin = await request.get('/api/documents').set('Authorization', `Bearer ${adminToken}`);
      expect(resAdmin.status).toBe(200);
      expect(Array.isArray(resAdmin.body)).toBeTrue();

      const resViewer = await request.get('/api/documents').set('Authorization', `Bearer ${viewerToken}`);
      expect(resViewer.status).toBe(200);
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return document details', async () => {
      const res = await request.get(`/api/documents/${documentId}`).set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(documentId);
    });

    it('should return 404 for non-existent document', async () => {
      const res = await request.get('/api/documents/609c5a7c12a9e32bfc0b0000').set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should allow admin to update document metadata', async () => {
      const res = await request.put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title', description: 'Updated Desc' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Document updated successfully');
      expect(res.body.document.title).toBe('Updated Title');
    });

    it('should allow editor to update document metadata', async () => {
      const res = await request.put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ description: 'Editor updated description' });

      expect(res.status).toBe(200);
      expect(res.body.document.description).toBe('Editor updated description');
    });

    it('should allow replacing document file', async () => {
      const res = await request.put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', path.join(__dirname, '../test-files/test2.pdf'));

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Document updated successfully');
    });

    it('should not allow viewer to update', async () => {
      const res = await request.put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ title: 'Fail Update' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should allow admin to delete document', async () => {
      const res = await request.delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Document deleted successfully');
    });

    it('should return 404 deleting non-existent document', async () => {
      const res = await request.delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should not allow viewer to delete', async () => {
      // Create a doc to test delete with viewer
      const uploadRes = await request.post('/api/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'ToDelete')
        .attach('file', path.join(__dirname, '../test-files/test.pdf'));
      const docId = uploadRes.body.document._id;

      const res = await request.delete(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
