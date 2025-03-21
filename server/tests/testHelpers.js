// Test helpers for database operations
const { Sequelize } = require('sequelize');
const path = require('path');

// Create a test database connection
const testDbPath = path.join(__dirname, '../test-database.sqlite');
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: testDbPath,
  logging: false
});

// Setup and teardown for tests requiring database
const setupTestDb = async () => {
  await testSequelize.authenticate();
  
  // Load models with the test database connection
  const Company = require('../src/models/company.model');
  const User = require('../src/models/user.model');
  
  // Sync all models to create tables in the test database
  await testSequelize.sync({ force: true });
  
  return { testSequelize, Company, User };
};

const teardownTestDb = async () => {
  await testSequelize.close();
};

// Mock JWT authentication middleware
const mockAuthMiddleware = {
  verifyToken: (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  },
  isAdmin: (req, res, next) => {
    req.userRole = 'admin';
    next();
  }
};

module.exports = {
  setupTestDb,
  teardownTestDb,
  mockAuthMiddleware,
  testSequelize
};