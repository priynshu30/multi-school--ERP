import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { NotFoundError } from './utils/appError.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { schoolRoutes } from './modules/schools/school.routes.js';
import { staffRoutes } from './modules/staff/staff.routes.js';
import { teacherRoutes } from './modules/teachers/teacher.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { studentRoutes } from './modules/students/student.routes.js';
import { parentRoutes } from './modules/parents/parent.routes.js';
import { academicsRoutes } from './modules/academics/academics.routes.js';
import { attendanceRoutes } from './modules/attendance/attendance.routes.js';
import { feeRoutes } from './modules/fees/fee.routes.js';
import { examRoutes } from './modules/exams/exam.routes.js';
import { homeworkRoutes } from './modules/homework/homework.routes.js';
import { timetableRoutes } from './modules/timetable/timetable.routes.js';
import { noticeRoutes } from './modules/notices/notice.routes.js';
import { transportRoutes } from './modules/transport/transport.routes.js';
import { reportsRoutes } from './modules/reports/reports.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-school-id'],
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP access logging via Morgan streaming to Winston
  const morganStream = {
    write: (message: string) => logger.info(message.trim()),
  };
  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: morganStream,
      skip: (req) => req.url === '/health',
    })
  );

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'multi-school-erp-server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Version 1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/schools', schoolRoutes);
  app.use('/api/v1/staff', staffRoutes);
  app.use('/api/v1/teachers', teacherRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/parents', parentRoutes);
  app.use('/api/v1/academics', academicsRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/fees', feeRoutes);
  app.use('/api/v1/exams', examRoutes);
  app.use('/api/v1/homework', homeworkRoutes);
  app.use('/api/v1/timetable', timetableRoutes);
  app.use('/api/v1/notices', noticeRoutes);
  app.use('/api/v1/transport', transportRoutes);
  app.use('/api/v1/reports', reportsRoutes);
  app.use('/api/v1/audit', auditRoutes);
  app.use('/api/v1/notifications', notificationRoutes);

  // Catch unhandled 404 routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
  });

  // Central error handling
  app.use(errorHandler);

  return app;
};
