// Authentication logic
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../user/model/user.model';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'defaultsecret';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req: Request & { user?: any }, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json(user);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
