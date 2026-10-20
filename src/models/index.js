// ONE Sequelize instance (one connection pool) for the whole API.
// Every other file imports it from here - nobody opens a second one.
const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');
const dbConfig = require('../config/database')[env.nodeEnv];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Load models
const Host = require('./host')(sequelize, DataTypes);
const QuestionSet = require('./questionSet')(sequelize, DataTypes);
const Question = require('./question')(sequelize, DataTypes);
const Choice = require('./choice')(sequelize, DataTypes);
const Session = require('./session')(sequelize, DataTypes);
const SessionPlayer = require('./sessionPlayer')(sequelize, DataTypes);
const Round = require('./round')(sequelize, DataTypes);
const Answer = require('./answer')(sequelize, DataTypes);

// Associations
// Host <-> QuestionSet
Host.hasMany(QuestionSet, { foreignKey: 'host_id', as: 'questionSets' });
QuestionSet.belongsTo(Host, { foreignKey: 'host_id', as: 'host' });

// QuestionSet <-> Question
QuestionSet.hasMany(Question, { foreignKey: 'question_set_id', as: 'questions' });
Question.belongsTo(QuestionSet, { foreignKey: 'question_set_id', as: 'questionSet' });

// QuestionSet <-> Session
QuestionSet.hasMany(Session, { foreignKey: 'question_set_id', as: 'sessions' });
Session.belongsTo(QuestionSet, { foreignKey: 'question_set_id', as: 'questionSet' });

// Host <-> Session
Host.hasMany(Session, { foreignKey: 'host_id', as: 'sessions' });
Session.belongsTo(Host, { foreignKey: 'host_id', as: 'host' });

// Session <-> SessionPlayer
Session.hasMany(SessionPlayer, { foreignKey: 'session_id', as: 'players' });
SessionPlayer.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// Session <-> Round
Session.hasMany(Round, { foreignKey: 'session_id', as: 'rounds' });
Round.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// Question <-> Round
Question.hasMany(Round, { foreignKey: 'question_id', as: 'rounds' });
Round.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// SessionPlayer <-> Round (through Answer)
SessionPlayer.belongsToMany(Round, { through: 'answers', foreignKey: 'session_player_id', as: 'rounds' });
Round.belongsToMany(SessionPlayer, { through: 'answers', foreignKey: 'round_id', as: 'players' });

// Round <-> Answer
Round.hasMany(Answer, { foreignKey: 'round_id', as: 'answers' });
Answer.belongsTo(Round, { foreignKey: 'round_id', as: 'round' });

// SessionPlayer <-> Answer
SessionPlayer.hasMany(Answer, { foreignKey: 'session_player_id', as: 'answers' });
Answer.belongsTo(SessionPlayer, { foreignKey: 'session_player_id', as: 'sessionPlayer' });

// Choice <-> Answer
Choice.hasMany(Answer, { foreignKey: 'choice_id', as: 'answers' });
Answer.belongsTo(Choice, { foreignKey: 'choice_id', as: 'choice' });

module.exports = {
  sequelize,
  Sequelize,
  DataTypes,
  Host,
  QuestionSet,
  Question,
  Choice,
  Session,
  SessionPlayer,
  Round,
  Answer,
};