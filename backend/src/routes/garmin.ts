import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/requireAuth';
import { connectMockGarmin, disconnectGarmin, syncTodayMock } from '../services/mockGarmin';

const router = Router();

router.get('/status', requireAuth, async (req: AuthedRequest, res) => {
  const conn = await prisma.garminConnection.findUnique({ where: { userId: req.userId! } });
  res.json({ connected: !!conn, isMock: conn?.isMock ?? null, lastSyncedAt: conn?.lastSyncedAt ?? null });
});

router.post('/connect-mock', requireAuth, async (req: AuthedRequest, res) => {
  await connectMockGarmin(req.userId!);
  res.json({ ok: true });
});

router.post('/sync', requireAuth, async (req: AuthedRequest, res) => {
  await syncTodayMock(req.userId!);
  res.json({ ok: true });
});

router.post('/disconnect', requireAuth, async (req: AuthedRequest, res) => {
  await disconnectGarmin(req.userId!);
  res.json({ ok: true });
});

// Placeholders for the real Garmin OAuth 2.0 PKCE flow, to be wired in once
// Garmin Developer Program access is approved.
router.get('/oauth/start', requireAuth, async (_req, res) => {
  res.status(501).json({ error: 'Real Garmin OAuth not yet configured — waiting on Garmin Developer Program approval.' });
});

router.get('/oauth/callback', async (_req, res) => {
  res.status(501).json({ error: 'Real Garmin OAuth not yet configured.' });
});

router.post('/webhook', async (req, res) => {
  // Real Garmin push notifications will land here once approved.
  console.log('[garmin:webhook] received (not yet processed):', JSON.stringify(req.body).slice(0, 500));
  res.status(200).send();
});

export default router;
