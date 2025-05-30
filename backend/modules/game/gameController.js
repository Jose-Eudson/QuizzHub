const pool = require('../db');

// Iniciar um quiz
const iniciarQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.usuario.id;

    // Verificar se o quiz existe
    const [quiz] = await pool.query('SELECT id FROM quizzes WHERE id = ?', [quizId]);
    
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }

    // Criar registro do jogo
    const [result] = await pool.query(
      'INSERT INTO player_games (player_id, quiz_id, started_at) VALUES (?, ?, NOW())',
      [userId, quizId]
    );

    // Obter primeira pergunta
    const [questions] = await pool.query(
      'SELECT id, question_text, time_limit, points FROM questions WHERE quiz_id = ? ORDER BY id LIMIT 1',
      [quizId]
    );

    if (questions.length === 0) {
      return res.status(400).json({ mensagem: 'Este quiz não tem perguntas' });
    }

    res.status(201).json({
      mensagem: 'Quiz iniciado',
      gameId: result.insertId,
      currentQuestion: questions[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao iniciar quiz' });
  }
};

// Responder pergunta
const responderPergunta = async (req, res) => {
  try {
    const { gameId, questionId } = req.params;
    const { answerId } = req.body;
    const userId = req.usuario.id;

    // Verificar se o jogo pertence ao usuário
    const [game] = await pool.query('SELECT player_id FROM player_games WHERE id = ?', [gameId]);
    
    if (game.length === 0) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado' });
    }
    
    if (game[0].player_id !== userId) {
      return res.status(403).json({ mensagem: 'Este jogo não pertence a você' });
    }

    // Verificar se a resposta existe e é correta
    const [answer] = await pool.query(
      'SELECT id, is_correct FROM answers WHERE id = ? AND question_id = ?',
      [answerId, questionId]
    );
    
    if (answer.length === 0) {
      return res.status(404).json({ mensagem: 'Resposta não encontrada' });
    }

    // Obter pontos da pergunta
    const [question] = await pool.query('SELECT points FROM questions WHERE id = ?', [questionId]);
    const points = answer[0].is_correct ? question[0].points : 0;

    // Registrar resposta
    await pool.query(
      'INSERT INTO scores (player_game_id, question_id, answer_id, points_earned) VALUES (?, ?, ?, ?)',
      [gameId, questionId, answerId, points]
    );

    // Obter próxima pergunta
    const [nextQuestion] = await pool.query(`
      SELECT q.id, q.question_text, q.time_limit, q.points 
      FROM questions q
      WHERE q.quiz_id = (SELECT quiz_id FROM player_games WHERE id = ?)
      AND q.id > ?
      ORDER BY q.id
      LIMIT 1
    `, [gameId, questionId]);

    if (nextQuestion.length === 0) {
      // Finalizar jogo se não houver mais perguntas
      await pool.query('UPDATE player_games SET finished_at = NOW() WHERE id = ?', [gameId]);
      
      // Calcular pontuação total
      const [totalScore] = await pool.query(
        'SELECT SUM(points_earned) as total FROM scores WHERE player_game_id = ?',
        [gameId]
      );
      
      return res.json({
        mensagem: 'Quiz concluído!',
        totalScore: totalScore[0].total || 0,
        finished: true
      });
    }

    res.json({
      mensagem: 'Resposta registrada',
      currentQuestion: nextQuestion[0],
      finished: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao responder pergunta' });
  }
};

// Obter ranking de um quiz
const obterRanking = async (req, res) => {
  try {
    const { quizId } = req.params;

    const [ranking] = await pool.query(`
      SELECT u.username, SUM(s.points_earned) as total_score
      FROM player_games pg
      JOIN scores s ON pg.id = s.player_game_id
      JOIN users u ON pg.player_id = u.id
      WHERE pg.quiz_id = ?
      GROUP BY pg.player_id
      ORDER BY total_score DESC
      LIMIT 10
    `, [quizId]);
    
    res.json(ranking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao obter ranking' });
  }
};

module.exports = {
  iniciarQuiz,
  responderPergunta,
  obterRanking
};
