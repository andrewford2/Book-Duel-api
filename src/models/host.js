module.exports = (sequelize, DataTypes) => {
  const Host = sequelize.define('Host', {
    host_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
      validate: { len: [3, 40] },
    },
    password_hash: {
      type: DataTypes.CHAR(60),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'hosts',
    timestamps: false,
  });

  return Host;
};