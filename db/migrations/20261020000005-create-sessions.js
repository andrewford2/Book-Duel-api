'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      session_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'hosts', key: 'host_id' },
      },
      question_set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'question_set_id' },
      },
      join_code: {
        type: Sequelize.CHAR(6),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'waiting',
      },
      end_reason: {
        type: Sequelize.STRING(25),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ended_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sessions');
  },
};