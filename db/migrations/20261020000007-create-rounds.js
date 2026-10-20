'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rounds', {
      round_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sessions', key: 'session_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
      },
      round_no: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(6),
        allowNull: false,
        defaultValue: 'open',
      },
      is_voided: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      deadline_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint('rounds', {
      fields: ['session_id', 'round_no'],
      type: 'unique',
      name: 'uq_round_no',
    });

    await queryInterface.addConstraint('rounds', {
      fields: ['session_id', 'question_id'],
      type: 'unique',
      name: 'uq_round_question',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('rounds', 'uq_round_no');
    await queryInterface.removeConstraint('rounds', 'uq_round_question');
    await queryInterface.dropTable('rounds');
  },
};