import { createApp } from './app.js';

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT invalide.');
const server = createApp();
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, host, () =>
  console.log(`API Rosée : http://${host}:${port}`),
);
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
function shutdown() {
  server.close(() => {
    process.exitCode = 0;
  });
  server.closeIdleConnections();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
