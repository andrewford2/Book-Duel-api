module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    session_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    host_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'hosts', key: 'host_id' },
    },
    question_set_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'question_sets', key: 'question_set_id' },
    },
    join_code: {
      type: DataTypes.CHAR(6),
      allowNull: false,
      unique: true,
      validate: { is: /^[1-9][0-9]{5}$/ },
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'waiting',
      validate: { isIn: [['waiting', 'playing', 'ended']] },
    },
    end_reason: {
      type: DataTypes.STRING(25),
      allowNull: true,
      validate: { isIn: [['last_player_standing', 'questions_ran_out', 'host_ended']] },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'sessions',
    timestamps: false,
  });

  return Session;
};