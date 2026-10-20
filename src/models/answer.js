module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define('Answer', {
    answer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    round_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'rounds', key: 'round_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    session_player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'session_players', key: 'session_player_id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    choice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'choices', key: 'choice_id' },
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    damage_taken: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      validate: { isIn: [[0, 1, 2]] },
    },
    score_earned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    answered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'answers',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['round_id', 'session_player_id'] },
    ],
  });

  return Answer;
};