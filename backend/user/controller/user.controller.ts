// User management logic
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../model/user.model';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createUser(req: Request, res: Response) {
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
      res.status(201).json({ message: 'User created successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, password, role } = req.body;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (name) user.name = name;
      if (email) {
        // Check if email taken by other user
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return res.status(409).json({ error: 'Email already registered' });
        }
        user.email = email;
      }
      if (password) user.password = await bcrypt.hash(password, 10);
      if (role) user.role = role;

      await user.save();
      res.json({ message: 'User updated successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}