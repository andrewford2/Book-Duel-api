module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    question_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    question_set_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'question_sets', key: 'question_set_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [1] },
    },
    type: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: { isIn: [['multiple_choice', 'true_false']] },
    },
    time_limit_sec: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 20,
      validate: { min: 5, max: 60 },
    },
    position: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 50 },
    },
  }, {
    tableName: 'questions',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['question_set_id', 'position'] },
    ],
  });

  return Question;
};