module.exports = (sequelize, DataTypes) => {
  const QuestionSet = sequelize.define('QuestionSet', {
    question_set_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    host_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'hosts', key: 'host_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { len: [3, 80] },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    grade_level: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'question_sets',
    timestamps: false,
  });

  return QuestionSet;
};