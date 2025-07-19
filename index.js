// index.ts
import app from './app';
import expressListRoutes from 'express-list-routes';
import cron from 'node-cron';
import { SERVER_PORT, POST_FETCH_CRON_EXPRESSION } from './settings';
import { SERVER_START_MESSAGE } from './constants';
import { db } from './db';

app.listen(SERVER_PORT, () => {
  console.log(SERVER_START_MESSAGE);
  expressListRoutes(app);

  cron.schedule(POST_FETCH_CRON_EXPRESSION, () => {
    console.log('Running scheduled job...');
    // You can query PostgreSQL using Drizzle here with `db`
  });
});
