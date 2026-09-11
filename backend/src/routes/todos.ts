import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId! },
    orderBy: [{ completedAt: 'asc' }, { dueAt: 'asc' }],
  });
  res.json(todos);
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z.object({ title: z.string().min(1), dueAt: z.string().datetime().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const todo = await prisma.todo.create({
    data: { title: parsed.data.title, dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null, userId: req.userId! },
  });
  res.json(todo);
});

router.patch('/:id/complete', requireAuth, async (req: AuthedRequest, res) => {
  const result = await prisma.todo.updateMany({
    where: { id: req.params.id, userId: req.userId! },
    data: { completedAt: new Date() },
  });
  res.json({ ok: true, count: result.count });
});

router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
  await prisma.todo.deleteMany({ where: { id: req.params.id, userId: req.userId! } });
  res.json({ ok: true });
});

export default router;
