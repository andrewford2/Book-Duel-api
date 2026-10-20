const { sequelize } = require('../models');

// The Hub asks /health whether the API can reach its database.
async function checkDatabase() {
  try {
    await sequelize.authenticate();
    return 'up';
  } catch (error) {
    console.error('Health check failed:', error.message);
    return 'down';
  }
}

module.exports = { checkDatabase };
