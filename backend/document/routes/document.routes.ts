// Document routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import { DocumentController } from '../controller/document.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    // Unique filename with timestamp
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// All routes require authentication
router.use(authenticateJWT);

// List documents - all roles can read
router.get('/', DocumentController.getAllDocuments);
router.get('/:id', DocumentController.getDocumentById);

// Only admin and editor can create/update/delete
router.post('/', authorizeRoles('admin', 'editor'), upload.single('file'), DocumentController.createDocument);
router.put('/:id', authorizeRoles('admin', 'editor'), upload.single('file'), DocumentController.updateDocument);
router.delete('/:id', authorizeRoles('admin', 'editor'), DocumentController.deleteDocument);

export default router;
