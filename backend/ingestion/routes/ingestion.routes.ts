// Ingestion routes
import express from 'express';
import {
  getAllIngestions,
  getIngestionById,
  createIngestion,
  updateIngestion,
  deleteIngestion,
} from '../controller/ingestion.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';

const router = express.Router();

// Admin/Editor Access
router.get('/', authenticateJWT, authorizeRoles('admin', 'editor'), getAllIngestions);
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'editor'), getIngestionById);
router.post('/', authenticateJWT, authorizeRoles('admin', 'editor'), createIngestion);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'editor'), updateIngestion);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteIngestion);

export default router;
