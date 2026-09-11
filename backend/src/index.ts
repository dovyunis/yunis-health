import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import garminRoutes from './routes/garmin';
import activitiesRoutes from './routes/activities';
import settingsRoutes from './routes/settings';
import notesRoutes from './routes/notes';
import todosRoutes from './routes/todos';
import cronRoutes from './routes/cron';
import { startScheduler } from './jobs/scheduler';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/garmin', garminRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/cron', cronRoutes);

app.listen(PORT, () => {
  console.log(`Yunis Health backend running on http://localhost:${PORT}`);
  startScheduler();
});
