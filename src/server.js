// Entry point: load config, then start listening.
const env = require('./config/env');
const app = require('./app');

const PORT = env.port;

app.listen(PORT, (error) => {
  if (error) {
    console.error(`Could not start the API: ${error.message}`);
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${PORT}/api/v1`);
  console.log(`   Health:       GET http://localhost:${PORT}/api/v1/health`);
  console.log(`   Game Info:    GET http://localhost:${PORT}/api/v1/game-info`);
  console.log(`   Auth Login:   POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`   Question Sets: CRUD http://localhost:${PORT}/api/v1/question-sets`);
  console.log(`   Sessions:     CRUD http://localhost:${PORT}/api/v1/sessions`);
});