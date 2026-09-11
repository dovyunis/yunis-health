import cron from 'node-cron';
import { runGoalCheck } from './goalCheckJob';

export function startScheduler() {
  cron.schedule('*/15 * * * *', () => {
    runGoalCheck().catch((err) => console.error('goalCheck failed', err));
  });
  console.log('Scheduler started: goal-check runs every 15 minutes');
}
