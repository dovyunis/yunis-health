import { prisma } from '../lib/prisma';
import { sendGoalReminderEmail } from '../services/notify';

export async function runGoalCheck(now: Date = new Date()) {
  const users = await prisma.user.findMany();
  const dateStr = now.toISOString().slice(0, 10);
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  for (const user of users) {
    if (currentHHMM < user.notifyTime) continue;

    const already = await prisma.notificationLog.findUnique({
      where: { userId_date_type: { userId: user.id, date: dateStr, type: 'goal_reminder' } },
    });
    if (already) continue;

    const summary = await prisma.dailyActivitySummary.findUnique({
      where: { userId_date: { userId: user.id, date: dateStr } },
    });
    const steps = summary?.steps ?? 0;
    if (steps >= user.stepGoal) continue;

    const result = await sendGoalReminderEmail(user.email, steps, user.stepGoal);
    await prisma.notificationLog.create({
      data: { userId: user.id, date: dateStr, type: 'goal_reminder', channel: result.method },
    });
  }
}
