import { Router } from 'express';
import { runGoalCheck } from '../jobs/goalCheckJob';

const router = Router();

// Hit by an external free scheduler (e.g. cron-job.org) every ~10-15 minutes.
// This both wakes a sleeping free-tier host AND runs the goal check directly,
// so reminders still fire even if the app's own in-process timer was asleep.
router.post('/goal-check', async (req, res) => {
  const secret = req.header('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await runGoalCheck();
    res.json({ ok: true });
  } catch (err) {
    console.error('cron goal-check failed', err);
    res.status(500).json({ ok: false });
  }
});

export default router;
