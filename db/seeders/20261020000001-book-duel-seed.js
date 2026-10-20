'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('demo123', 10);
    const now = Date.now();

    // 1. One account for the host, plus the host login record that points at it.
    const [hostUser] = await queryInterface.bulkInsert('users', [{
      school_id: 'HOST001',
      full_name: 'Marabel Ginga Germedia',
      email: 'marabelgermedia6@gmail.com',
      role: 'host',
      password_hash: passwordHash,
      created_at: new Date(now),
      updated_at: new Date(now),
    }], { returning: ['user_id'] });

    const [host] = await queryInterface.bulkInsert('hosts', [{
      username: 'marabel',
      password_hash: passwordHash,
      user_id: hostUser.user_id,
      created_at: new Date(now),
    }], { returning: ['host_id'] });

    const hostId = host.host_id;

    // 2. Five player accounts.
    const playerUsers = await queryInterface.bulkInsert('users', [
      { school_id: '20240001', full_name: 'Anna Santos', email: 'anna.santos@sorsu.edu.ph', role: 'player', password_hash: passwordHash, created_at: new Date(now), updated_at: new Date(now) },
      { school_id: '20240002', full_name: 'Ben Cruz', email: 'ben.cruz@sorsu.edu.ph', role: 'player', password_hash: passwordHash, created_at: new Date(now), updated_at: new Date(now) },
      { school_id: '20240003', full_name: 'Carla Reyes', email: 'carla.reyes@sorsu.edu.ph', role: 'player', password_hash: passwordHash, created_at: new Date(now), updated_at: new Date(now) },
      { school_id: '20240004', full_name: 'Dan Garcia', email: 'dan.garcia@sorsu.edu.ph', role: 'player', password_hash: passwordHash, created_at: new Date(now), updated_at: new Date(now) },
      { school_id: '20240005', full_name: 'Eva Lopez', email: 'eva.lopez@sorsu.edu.ph', role: 'player', password_hash: passwordHash, created_at: new Date(now), updated_at: new Date(now) },
    ], { returning: ['user_id'] });

    const playerUserIds = playerUsers.map((p) => p.user_id);

    // 3. A question set owned by the host.
    const [questionSet] = await queryInterface.bulkInsert('question_sets', [{
      host_id: hostId,
      title: 'Philippine Literature',
      description: 'Questions about famous Filipino literary works',
      subject: 'Literature',
      grade_level: 'College',
      created_at: new Date(now),
      updated_at: new Date(now),
    }], { returning: ['question_set_id'] });

    const questionSetId = questionSet.question_set_id;

    // 4. Three questions, in order.
    const questions = await queryInterface.bulkInsert('questions', [
      { question_set_id: questionSetId, text: 'Who wrote "Noli Me Tangere"?', type: 'multiple_choice', time_limit_sec: 15, position: 1 },
      { question_set_id: questionSetId, text: 'Rizal wrote "Noli Me Tangere."', type: 'true_false', time_limit_sec: 10, position: 2 },
      { question_set_id: questionSetId, text: 'Who is the protagonist of "El Filibusterismo"?', type: 'multiple_choice', time_limit_sec: 20, position: 3 },
    ], { returning: ['question_id', 'position'] });

    const correctChoiceByPosition = {};
    const choicesData = [];
    for (const q of questions) {
      const choices = {
        1: [
          { text: 'Jose Rizal', is_correct: true },
          { text: 'Andres Bonifacio', is_correct: false },
          { text: 'Emilio Aguinaldo', is_correct: false },
          { text: 'Apolinario Mabini', is_correct: false },
        ],
        2: [
          { text: 'True', is_correct: true },
          { text: 'False', is_correct: false },
        ],
        3: [
          { text: 'Crisostomo Ibarra', is_correct: false },
          { text: 'Simoun', is_correct: true },
          { text: 'Basilio', is_correct: false },
          { text: 'Isagani', is_correct: false },
        ],
      }[q.position];

      choices.forEach((choice, index) => {
        choicesData.push({ question_id: q.question_id, text: choice.text, position: index, is_correct: choice.is_correct });
      });
    }
    await queryInterface.bulkInsert('choices', choicesData);

    // 5. One finished game: five seats, three rounds, every player's answers.
    const [session] = await queryInterface.bulkInsert('sessions', [{
      host_id: hostId,
      question_set_id: questionSetId,
      join_code: '482913',
      status: 'ended',
      end_reason: 'questions_ran_out',
      created_at: new Date(now - 3600000),
      started_at: new Date(now - 3500000),
      ended_at: new Date(now - 3000000),
    }], { returning: ['session_id'] });

    const sessionId = session.session_id;

    const players = await queryInterface.bulkInsert('session_players', [
      { session_id: sessionId, user_id: playerUserIds[0], nickname: 'Anna', hp: 4, score: 300, is_eliminated: false, is_winner: true, joined_at: new Date(now - 3550000) },
      { session_id: sessionId, user_id: playerUserIds[1], nickname: 'Ben', hp: 3, score: 200, is_eliminated: false, is_winner: false, joined_at: new Date(now - 3540000) },
      { session_id: sessionId, user_id: playerUserIds[2], nickname: 'Carla', hp: 4, score: 250, is_eliminated: false, is_winner: false, joined_at: new Date(now - 3530000) },
      { session_id: sessionId, user_id: playerUserIds[3], nickname: 'Dan', hp: 0, score: 100, is_eliminated: true, is_winner: false, joined_at: new Date(now - 3520000) },
      { session_id: sessionId, user_id: playerUserIds[4], nickname: 'Eva', hp: 5, score: 0, is_eliminated: false, is_winner: false, joined_at: new Date(now - 3510000) },
    ], { returning: ['session_player_id'] });

    const questionsForSession = await queryInterface.sequelize.query(
      'SELECT question_id FROM questions WHERE question_set_id = ? ORDER BY position',
      { replacements: [questionSetId], type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const rounds = await queryInterface.bulkInsert('rounds', [
      { session_id: sessionId, question_id: questionsForSession[0].question_id, round_no: 1, status: 'closed', is_voided: false, started_at: new Date(now - 3400000), deadline_at: new Date(now - 3399000), closed_at: new Date(now - 3398000) },
      { session_id: sessionId, question_id: questionsForSession[1].question_id, round_no: 2, status: 'closed', is_voided: false, started_at: new Date(now - 3300000), deadline_at: new Date(now - 3299000), closed_at: new Date(now - 3298000) },
      { session_id: sessionId, question_id: questionsForSession[2].question_id, round_no: 3, status: 'closed', is_voided: false, started_at: new Date(now - 3200000), deadline_at: new Date(now - 3199000), closed_at: new Date(now - 3198000) },
    ], { returning: ['round_id'] });

    // Correct choice for each question, looked up after the insert.
    const correctChoices = await queryInterface.sequelize.query(
      `SELECT c.question_id, c.choice_id
       FROM choices c
       WHERE c.is_correct = true AND c.question_id IN (
         SELECT question_id FROM questions WHERE question_set_id = ?
       )`,
      { replacements: [questionSetId], type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const correctMap = {};
    correctChoices.forEach((c) => { correctMap[c.question_id] = c.choice_id; });

    // Every player answers every round, except Eva who leaves after round 1.
    // Anna, Ben, Carla and Dan answer all three questions and therefore completed
    // the tournament; Eva did not finish it.
    const answersData = [];
    const results = [
      // playerIndex, correct flags per round, damage per round, score per round
      { player: 0, correct: [true, true, true], damage: [0, 0, 0], score: [100, 100, 100] },
      { player: 1, correct: [true, true, false], damage: [0, 0, 2], score: [100, 100, 0] },
      { player: 2, correct: [true, true, false], damage: [0, 0, 1], score: [100, 100, 0] },
      { player: 3, correct: [true, false, false], damage: [0, 2, 2], score: [100, 0, 0] },
    ];

    results.forEach((result) => {
      rounds.forEach((round, index) => {
        answersData.push({
          round_id: round.round_id,
          session_player_id: players[result.player].session_player_id,
          choice_id: correctMap[questionsForSession[index].question_id],
          is_correct: result.correct[index],
          damage_taken: result.damage[index],
          score_earned: result.score[index],
          answered_at: new Date(now - 3400000 + index * 100000 + result.player * 100),
        });
      });
    });

    // Eva joins but never answers: one empty answer row keeps her out of the podium.
    answersData.push({
      round_id: rounds[0].round_id,
      session_player_id: players[4].session_player_id,
      choice_id: null,
      is_correct: false,
      damage_taken: 0,
      score_earned: 0,
      answered_at: null,
    });

    await queryInterface.bulkInsert('answers', answersData);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('answers', null, {});
    await queryInterface.bulkDelete('rounds', null, {});
    await queryInterface.bulkDelete('session_players', null, {});
    await queryInterface.bulkDelete('sessions', null, {});
    await queryInterface.bulkDelete('choices', null, {});
    await queryInterface.bulkDelete('questions', null, {});
    await queryInterface.bulkDelete('question_sets', null, {});
    await queryInterface.bulkDelete('hosts', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
