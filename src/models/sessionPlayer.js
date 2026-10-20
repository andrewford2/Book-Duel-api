module.exports = (sequelize, DataTypes) => {
  const SessionPlayer = sequelize.define('SessionPlayer', {
    session_player_id: {
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
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { len: [2, 20] },
    },
    hp: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 5,
      validate: { min: 0, max: 5 },
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    is_eliminated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_winner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'session_players',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['session_id', 'nickname'] },
    ],
  });

  return SessionPlayer;
};