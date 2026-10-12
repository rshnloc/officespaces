import { app } from './app.js';
import { config } from './config/index.js';
import { db } from './database/store.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Gramwork Spaces Node.js Backend listening on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🏢 Loaded ${db.spaces.length} office spaces, ${db.locations.length} locations, ${db.users.length} users`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Saving database and closing HTTP server...');
  db.forceSave();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Saving database and closing HTTP server...');
  db.forceSave();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
