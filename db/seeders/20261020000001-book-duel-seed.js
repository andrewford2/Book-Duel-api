'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('demo123', 10);

    // 1. Create host user
    const [host] = await queryInterface.bulkInsert('hosts', [{
      username: 'demo_host',
      password_hash: passwordHash,
      created_at: new Date(),
    }], { returning: ['host_id'] });

    const hostId = host.host_id;

    // 2. Create question set
    const [questionSet] = await queryInterface.bulkInsert('question_sets', [{
      host_id: hostId,
      title: 'Philippine Literature',
      description: 'Questions about famous Filipino literary works',
      subject: 'Literature',
      grade_level: 'College',
      created_at: new Date(),
    }], { returning: ['question_set_id'] });

    const questionSetId = questionSet.question_set_id;

    // 3. Create questions
    const questions = await queryInterface.bulkInsert('questions', [
      {
        question_set_id: questionSetId,
        text: 'Who wrote "Noli Me Tangere"?',
        type: 'multiple_choice',
        time_limit_sec: 15,
        position: 1,
      },
      {
        question_set_id: questionSetId,
        text: 'Rizal wrote "Noli Me Tangere."',
        type: 'true_false',
        time_limit_sec: 10,
        position: 2,
      },
      {
        question_set_id: questionSetId,
        text: 'Who is the protagonist of "El Filibusterismo"?',
        type: 'multiple_choice',
        time_limit_sec: 20,
        position: 3,
      },
    ], { returning: ['question_id'] });

    // 4. Create choices
    const choicesData = [];
    for (const q of questions) {
      if (q.position === 1) {
        choicesData.push(
          { question_id: q.question_id, text: 'Jose Rizal', position: 0, is_correct: true },
          { question_id: q.question_id, text: 'Andres Bonifacio', position: 1, is_correct: false },
          { question_id: q.question_id, text: 'Emilio Aguinaldo', position: 2, is_correct: false },
          { question_id: q.question_id, text: 'Apolinario Mabini', position: 3, is_correct: false }
        );
      } else if (q.position === 2) {
        choicesData.push(
          { question_id: q.question_id, text: 'True', position: 0, is_correct: true },
          { question_id: q.question_id, text: 'False', position: 1, is_correct: false }
        );
      } else if (q.position === 3) {
        choicesData.push(
          { question_id: q.question_id, text: 'Crisostomo Ibarra', position: 0, is_correct: false },
          { question_id: q.question_id, text: 'Simoun', position: 1, is_correct: true },
          { question_id: q.question_id, text: 'Basilio', position: 2, is_correct: false },
          { question_id: q.question_id, text: 'Isagani', position: 3, is_correct: false }
        );
      }
    }
    await queryInterface.bulkInsert('choices', choicesData);

    // 5. Create a completed session with 3 completed players
    const [session] = await queryInterface.bulkInsert('sessions', [{
      host_id: hostId,
      question_set_id: questionSetId,
      join_code: '482913',
      status: 'ended',
      end_reason: 'questions_ran_out',
      created_at: new Date(Date.now() - 3600000),
      started_at: new Date(Date.now() - 3500000),
      ended_at: new Date(),
    }], { returning: ['session_id'] });

    const sessionId = session.session_id;

    // 5 players: 3 completed, 1 eliminated, 1 incomplete
    const players = await queryInterface.bulkInsert('session_players', [
      {
        session_id: sessionId,
        nickname: 'Anna',
        hp: 4,
        score: 300,
        is_eliminated: false,
        is_winner: true,
        joined_at: new Date(Date.now() - 3550000),
      },
      {
        session_id: sessionId,
        nickname: 'Ben',
        hp: 3,
        score: 200,
        is_eliminated: false,
        is_winner: false,
        joined_at: new Date(Date.now() - 3540000),
      },
      {
        session_id: sessionId,
        nickname: 'Carla',
        hp: 4,
        score: 250,
        is_eliminated: false,
        is_winner: false,
        joined_at: new Date(Date.now() - 3530000),
      },
      {
        session_id: sessionId,
        nickname: 'Dan',
        hp: 0,
        score: 100,
        is_eliminated: true,
        is_winner: false,
        joined_at: new Date(Date.now() - 3520000),
      },
      {
        session_id: sessionId,
        nickname: 'Eva',
        hp: 5,
        score: 0,
        is_eliminated: false,
        is_winner: false,
        joined_at: new Date(Date.now() - 3510000),
      },
    ], { returning: ['session_player_id'] });

    // Create rounds (3 rounds, all completed)
    const questionsForSession = await queryInterface.sequelize.query(
      'SELECT question_id FROM questions WHERE question_set_id = ? ORDER BY position',
      { replacements: [questionSetId], type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const rounds = await queryInterface.bulkInsert('rounds', [
      {
        session_id: sessionId,
        question_id: questionsForSession[0].question_id,
        round_no: 1,
        status: 'closed',
        is_voided: false,
        started_at: new Date(Date.now() - 3400000),
        deadline_at: new Date(Date.now() - 3399000),
        closed_at: new Date(Date.now() - 3398000),
      },
      {
        session_id: sessionId,
        question_id: questionsForSession[1].question_id,
        round_no: 2,
        status: 'closed',
        is_voided: false,
        started_at: new Date(Date.now() - 3300000),
        deadline_at: new Date(Date.now() - 3299000),
        closed_at: new Date(Date.now() - 3298000),
      },
      {
        session_id: sessionId,
        question_id: questionsForSession[2].question_id,
        round_no: 3,
        status: 'closed',
        is_voided: false,
        started_at: new Date(Date.now() - 3200000),
        deadline_at: new Date(Date.now() - 3199000),
        closed_at: new Date(Date.now() - 3198000),
      },
    ], { returning: ['round_id'] });

    // Get correct choices for each question
    const [correctChoices] = await queryInterface.sequelize.query(
      `SELECT q.question_id, c.choice_id, c.is_correct
       FROM questions q
       JOIN choices c ON c.question_id = q.question_id
       WHERE q.question_set_id = ? AND c.is_correct = true`,
      { replacements: [questionSetId], type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const correctMap = {};
    correctChoices.forEach(c => correctMap[c.question_id] = c.choice_id);

    // Create answers for all players in all rounds
    const answersData = [];

    // Anna: all correct (300 pts, 5 HP)
    answersData.push(
      { round_id: rounds[0].round_id, session_player_id: players[0].session_player_id, choice_id: correctMap[questionsForSession[0].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3399500) },
      { round_id: rounds[1].round_id, session_player_id: players[0].session_player_id, choice_id: correctMap[questionsForSession[1].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3299500) },
      { round_id: rounds[2].round_id, session_player_id: players[0].session_player_id, choice_id: correctMap[questionsForSession[2].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3199500) }
    );

    // Ben: 2 correct, 1 wrong (200 pts, 3 HP - took 2 damage in roulette)
    answersData.push(
      { round_id: rounds[0].round_id, session_player_id: players[1].session_player_id, choice_id: correctMap[questionsForSession[0].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3399600) },
      { round_id: rounds[1].round_id, session_player_id: players[1].session_player_id, choice_id: correctMap[questionsForSession[1].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3299600) },
      { round_id: rounds[2].round_id, session_player_id: players[1].session_player_id, choice_id: correctMap[questionsForSession[2].question_id], is_correct: false, damage_taken: 2, score_earned: 0, answered_at: new Date(Date.now() - 3199600) }
    );

    // Carla: 2 correct, 1 wrong (250 pts, 4 HP - took 1 damage)
    answersData.push(
      { round_id: rounds[0].round_id, session_player_id: players[2].session_player_id, choice_id: correctMap[questionsForSession[0].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3399700) },
      { round_id: rounds[1].round_id, session_player_id: players[2].session_player_id, choice_id: correctMap[questionsForSession[1].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3299700) },
      { round_id: rounds[2].round_id, session_player_id: players[2].session_player_id, choice_id: correctMap[questionsForSession[2].question_id], is_correct: false, damage_taken: 1, score_earned: 0, answered_at: new Date(Date.now() - 3199700) }
    );

    // Dan: eliminated (1 correct, 2 wrong - HP 0, eliminated)
    answersData.push(
      { round_id: rounds[0].round_id, session_player_id: players[3].session_player_id, choice_id: correctMap[questionsForSession[0].question_id], is_correct: true, damage_taken: 0, score_earned: 100, answered_at: new Date(Date.now() - 3399800) },
      { round_id: rounds[1].round_id, session_player_id: players[3].session_player_id, choice_id: correctMap[questionsForSession[1].question_id], is_correct: false, damage_taken: 2, score_earned: 0, answered_at: new Date(Date.now() - 3299800) },
      { round_id: rounds[2].round_id, session_player_id: players[3].session_player_id, choice_id: correctMap[questionsForSession[2].question_id], is_correct: false, damage_taken: 2, score_earned: 0, answered_at: new Date(Date.now() - 3199800) }
    );

    // Eva: incomplete (joined but didn't answer much)
    answersData.push(
      { round_id: rounds[0].round_id, session_player_id: players[4].session_player_id, choice_id: null, is_correct: false, damage_taken: 0, score_earned: 0, answered_at: null }
    );

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
  },
};