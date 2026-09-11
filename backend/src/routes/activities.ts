import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';

const router = Router();

router.get('/daily', requireAuth, async (req: AuthedRequest, res) => {
  const days = Math.min(parseInt((req.query.days as string) || '7', 10) || 7, 90);
  const rows = await prisma.dailyActivitySummary.findMany({
    where: { userId: req.userId! },
    orderBy: { date: 'desc' },
    take: days,
  });
  res.json(rows.reverse());
});

router.get('/today', requireAuth, async (req: AuthedRequest, res) => {
  const dateStr = new Date().toISOString().slice(0, 10);
  const row = await prisma.dailyActivitySummary.findUnique({
    where: { userId_date: { userId: req.userId!, date: dateStr } },
  });
  res.json(row || { userId: req.userId, date: dateStr, steps: 0, distanceMeters: 0, activeCalories: 0, floorsClimbed: 0 });
});

router.get('/sessions', requireAuth, async (req: AuthedRequest, res) => {
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10) || 20, 100);
  const rows = await prisma.activity.findMany({
    where: { userId: req.userId! },
    orderBy: { startTime: 'desc' },
    take: limit,
  });
  res.json(rows);
});

export default router;
