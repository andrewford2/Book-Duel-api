'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('session_players', {
      session_player_id: {
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
      nickname: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      hp: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 5,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_eliminated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_winner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addConstraint('session_players', {
      fields: ['session_id', 'nickname'],
      type: 'unique',
      name: 'uq_player_nickname',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('session_players', 'uq_player_nickname');
    await queryInterface.dropTable('session_players');
  },
};