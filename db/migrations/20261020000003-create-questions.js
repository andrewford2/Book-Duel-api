'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      question_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'question_set_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      time_limit_sec: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 20,
      },
      position: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('questions', {
      fields: ['question_set_id', 'position'],
      type: 'unique',
      name: 'uq_question_position',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('questions');
  },
};