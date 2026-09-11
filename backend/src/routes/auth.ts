import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, signToken } from '../lib/auth';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';

const router = Router();

// In production the frontend and backend live on different domains (e.g. two
// separate Render services), so the cookie needs SameSite=None + Secure to be
// sent cross-site. Locally (http://localhost) that combination doesn't work,
// so we fall back to Lax there instead.
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTS = {
  httpOnly: true as const,
  sameSite: (isProd ? 'none' : 'lax') as const,
  secure: isProd,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });
  const token = signToken(user.id);
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ id: user.id, email: user.email, name: user.name });
});

router.post('/login', async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  const token = signToken(user.id);
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ id: user.id, email: user.email, name: user.name });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    stepGoal: user.stepGoal,
    notifyTime: user.notifyTime,
    notifyChannel: user.notifyChannel,
    timezone: user.timezone,
  });
});

export default router;
