// Auth route definitions
import express from 'express';
import { AuthController } from '../controller/auth.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticateJWT, AuthController.getProfile);

export default router;
