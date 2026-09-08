import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { seedDatabase } from './database/seed.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Run seed check
    await seedDatabase();

    // 3. Create Express app and listen
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`Multi-School ERP Server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Closing HTTP server and database connections...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server shutdown complete. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error: any) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
