import nodemailer from 'nodemailer';

export async function sendGoalReminderEmail(to: string, steps: number, goal: number) {
  const remaining = Math.max(goal - steps, 0);
  const subject = `Yunis Health: ${remaining.toLocaleString()} steps to go today`;
  const text = `You're at ${steps.toLocaleString()} of your ${goal.toLocaleString()} step goal today. ${remaining.toLocaleString()} steps to go — a short walk now will get you there.`;

  if (!process.env.SMTP_HOST) {
    console.log(`[notify:console] To: ${to} | ${subject} | ${text}`);
    return { delivered: false, method: 'console' as const };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Yunis Health <no-reply@yunis-health.local>',
    to,
    subject,
    text,
  });

  return { delivered: true, method: 'email' as const };
}
