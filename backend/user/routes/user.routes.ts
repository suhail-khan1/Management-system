// User management routes
import express from 'express';
import { UserController } from '../controller/user.controller';
import { authenticateJWT, authorizeRoles } from '../../middleware/auth.middleware';

const router = express.Router();

// Only admin can access user management
router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
