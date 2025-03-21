const { Sequelize } = require('sequelize');
require('dotenv').config();

// For development, use SQLite instead of PostgreSQL
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

module.exports = sequelize;
