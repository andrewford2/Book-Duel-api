module.exports = (sequelize, DataTypes) => {
  const Choice = sequelize.define('Choice', {
    choice_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'questions', key: 'question_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    text: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { len: [1, 120] },
    },
    position: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 0, max: 3 },
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'choices',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['question_id', 'position'] },
    ],
  });

  return Choice;
};