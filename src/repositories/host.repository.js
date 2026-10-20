const { Host } = require('../models');

async function findByUsername(username) {
  return Host.findOne({ where: { username } });
}

async function findById(hostId) {
  return Host.findByPk(hostId);
}

async function createHost(data) {
  return Host.create(data);
}

module.exports = { findByUsername, findById, createHost };