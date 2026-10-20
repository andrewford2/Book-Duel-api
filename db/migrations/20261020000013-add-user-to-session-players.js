'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('session_players', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'user_id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Design Change Notice 01: one seat per account per game.
    await queryInterface.addConstraint('session_players', {
      fields: ['session_id', 'user_id'],
      type: 'unique',
      name: 'uq_one_seat_per_account',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('session_players', 'uq_one_seat_per_account');
    await queryInterface.removeColumn('session_players', 'user_id');
  },
};
