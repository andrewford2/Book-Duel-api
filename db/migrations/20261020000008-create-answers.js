'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      answer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      round_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rounds', key: 'round_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      session_player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'session_players', key: 'session_player_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      choice_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'choices', key: 'choice_id' },
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      damage_taken: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
      },
      score_earned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint('answers', {
      fields: ['round_id', 'session_player_id'],
      type: 'unique',
      name: 'uq_one_answer',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('answers', 'uq_one_answer');
    await queryInterface.dropTable('answers');
  },
};