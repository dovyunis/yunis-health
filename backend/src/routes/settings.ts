import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';

const router = Router();

const updateSchema = z.object({
  stepGoal: z.number().int().min(1000).max(50000).optional(),
  notifyTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  notifyChannel: z.enum(['email']).optional(),
  timezone: z.string().optional(),
  name: z.string().optional(),
});

router.put('/', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.update({ where: { id: req.userId! }, data: parsed.data });
  res.json({
    stepGoal: user.stepGoal,
    notifyTime: user.notifyTime,
    notifyChannel: user.notifyChannel,
    timezone: user.timezone,
    name: user.name,
  });
});

export default router;
