import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../data/store.js';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../models/types.js';

const router = Router();

// Signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'student', phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole: UserRole = role === 'admin' ? 'admin' : role === 'faculty' ? 'faculty' : 'student';

    const newUser = await dbStore.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: userRole,
      phone: phone || '',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Logged in successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Quick Demo Login for one-click testing
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role = 'student' } = req.body;
    let targetEmail = 'alex.rivera@campus.edu';
    if (role === 'admin') {
      targetEmail = 'admin@campus.edu';
    } else if (role === 'student2') {
      targetEmail = 'sarah.chen@campus.edu';
    }

    const user = await dbStore.findUserByEmail(targetEmail);
    if (!user) {
      res.status(404).json({ error: 'Demo user account not found.' });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: `Switched to ${user.name} (${user.role})`,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: 'Demo login failed.' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

export default router;
