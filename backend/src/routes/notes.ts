import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const notes = await prisma.healthNote.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: 'desc' } });
  res.json(notes);
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = z
    .object({ noteText: z.string().min(1), mood: z.string().optional(), tags: z.string().optional() })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const note = await prisma.healthNote.create({ data: { ...parsed.data, userId: req.userId! } });
  res.json(note);
});

router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
  await prisma.healthNote.deleteMany({ where: { id: req.params.id, userId: req.userId! } });
  res.json({ ok: true });
});

export default router;
