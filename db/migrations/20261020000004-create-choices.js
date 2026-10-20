'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('choices', {
      choice_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      text: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      position: {
        type: Sequelize.SMALLINT,
        allowNull: false,
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    await queryInterface.addConstraint('choices', {
      fields: ['question_id', 'position'],
      type: 'unique',
      name: 'uq_choice_position',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('choices');
  },
};