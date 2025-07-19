// index.ts
import app from './app';
import expressListRoutes from 'express-list-routes';
import { SERVER_PORT } from './settings';
import { SERVER_START_MESSAGE } from './constants';

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(SERVER_PORT, () => {
  console.log(SERVER_START_MESSAGE);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Available routes:');
    expressListRoutes(app);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 