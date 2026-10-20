module.exports = (sequelize, DataTypes) => {
  const Round = sequelize.define('Round', {
    round_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'sessions', key: 'session_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'questions', key: 'question_id' },
    },
    round_no: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.STRING(6),
      allowNull: false,
      defaultValue: 'open',
      validate: { isIn: [['open', 'closed']] },
    },
    is_voided: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deadline_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'rounds',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['session_id', 'round_no'] },
      { unique: true, fields: ['session_id', 'question_id'] },
    ],
  });

  return Round;
};