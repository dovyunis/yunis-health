import { prisma } from '../lib/prisma';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function connectMockGarmin(userId: string) {
  await prisma.garminConnection.upsert({
    where: { userId },
    update: { isMock: true, connectedAt: new Date(), garminUserId: `mock-${userId.slice(0, 8)}` },
    create: { userId, isMock: true, garminUserId: `mock-${userId.slice(0, 8)}` },
  });
  await backfillMockData(userId, 14);
}

export async function disconnectGarmin(userId: string) {
  await prisma.garminConnection.deleteMany({ where: { userId } });
}

export async function backfillMockData(userId: string, days: number) {
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const steps = randomInt(3000, 12000);

    await prisma.dailyActivitySummary.upsert({
      where: { userId_date: { userId, date: dateStr } },
      update: {
        steps,
        distanceMeters: steps * 0.8,
        activeCalories: Math.round(steps * 0.04),
        floorsClimbed: randomInt(0, 10),
        source: 'mock',
        syncedAt: new Date(),
      },
      create: {
        userId,
        date: dateStr,
        steps,
        distanceMeters: steps * 0.8,
        activeCalories: Math.round(steps * 0.04),
        floorsClimbed: randomInt(0, 10),
        source: 'mock',
      },
    });

    if (i % 3 === 0) {
      const type = Math.random() > 0.5 ? 'running' : 'walking';
      const distanceMeters = type === 'running' ? randomInt(3000, 8000) : randomInt(1500, 4000);
      const durationSeconds = type === 'running' ? Math.round(distanceMeters / 2.8) : Math.round(distanceMeters / 1.3);
      const garminActivityId = `mock-${userId}-${dateStr}-${type}`;

      const exists = await prisma.activity.findUnique({ where: { garminActivityId } });
      if (!exists) {
        const startTime = new Date(d);
        startTime.setHours(randomInt(6, 19), randomInt(0, 59), 0, 0);

        await prisma.activity.create({
          data: {
            userId,
            garminActivityId,
            type,
            startTime,
            durationSeconds,
            distanceMeters,
            calories: Math.round(distanceMeters * 0.06),
            avgHeartRate: type === 'running' ? randomInt(140, 170) : randomInt(90, 120),
            steps: Math.round(distanceMeters * 1.3),
          },
        });
      }
    }
  }
}

export async function syncTodayMock(userId: string) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const steps = randomInt(3000, 12000);

  await prisma.dailyActivitySummary.upsert({
    where: { userId_date: { userId, date: dateStr } },
    update: { steps, distanceMeters: steps * 0.8, activeCalories: Math.round(steps * 0.04), syncedAt: new Date() },
    create: { userId, date: dateStr, steps, distanceMeters: steps * 0.8, activeCalories: Math.round(steps * 0.04), source: 'mock' },
  });

  await prisma.garminConnection.updateMany({ where: { userId }, data: { lastSyncedAt: new Date() } });
}
