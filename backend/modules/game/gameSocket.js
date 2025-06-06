const pool = require('../db');

const activeGames = new Map();

async function sendNextQuestion(io, gameId) {
  const game = activeGames.get(gameId);
  if (!game) return;

  if (game.currentQuestionIndex >= game.questions.length) {
   
    io.to(`game_${gameId}`).emit('game:finished', { finalScores: game.players });
    activeGames.delete(gameId); // Limpa o jogo da memória
    await pool.query("UPDATE games SET status = 'finished' WHERE id = ?", [gameId]);
    return;
  }
  
  const question = game.questions[game.currentQuestionIndex];
  
  const questionForPlayers = {
    id: question.id,
    question_text: question.question_text,
    points: question.points,
    answers: question.answers.map(a => ({ id: a.id, answer_text: a.answer_text }))
  };

  io.to(`game_${gameId}`).emit('game:nextQuestion', {
    question: questionForPlayers,
    questionIndex: game.currentQuestionIndex,
    totalQuestions: game.questions.length
  });

  game.questionTimer = setTimeout(() => {
    showQuestionResults(io, gameId);
  }, 20000); 
}

async function showQuestionResults(io, gameId) {
  const game = activeGames.get(gameId);
  if (!game) return;

  clearTimeout(game.questionTimer); // Para o timer

  const currentQuestion = game.questions[game.currentQuestionIndex];
  const correctAnswerId = currentQuestion.answers.find(a => a.is_correct).id;

  const ranking = Object.values(game.players).sort((a, b) => b.score - a.score);

  io.to(`game_${gameId}`).emit('game:questionResult', {
    correctAnswerId,
    scores: ranking
  });
}

function initializeGameSockets(io) {
  io.on('connection', (socket) => {
    // --- Lógica do Lobby (já implementada) ---
    socket.on('host:join', ({ gameId }) => socket.join(`host_${gameId}`));
    socket.on('player:join', ({ gameId }) => socket.join(`game_${gameId}`));
    
    // --- Lógica da Partida ---

    // Host inicia o jogo
    socket.on('game:start', async ({ gameId }) => {
      try {
        // 1. Mudar status do jogo no DB
        await pool.query("UPDATE games SET status = 'in_progress' WHERE id = ?", [gameId]);

        const [quizRows] = await pool.query(`
          SELECT 
            q.id as question_id, q.question_text, q.points,
            a.id as answer_id, a.answer_text, a.is_correct
          FROM questions q
          JOIN answers a ON q.id = a.question_id
          WHERE q.quiz_id = (SELECT quiz_id FROM games WHERE id = ?)
          ORDER BY q.id, a.id;
        `, [gameId]);

        const questionsMap = new Map();
        quizRows.forEach(row => {
          if (!questionsMap.has(row.question_id)) {
            questionsMap.set(row.question_id, {
              id: row.question_id,
              question_text: row.question_text,
              points: row.points,
              answers: []
            });
          }
          questionsMap.get(row.question_id).answers.push({
            id: row.answer_id,
            answer_text: row.answer_text,
            is_correct: !!row.is_correct
          });
        });

        activeGames.set(gameId, {
          questions: Array.from(questionsMap.values()),
          players: {}, 
          currentQuestionIndex: 0,
          questionTimer: null,
        });

        io.to(`game_${gameId}`).emit('game:started');
        
        setTimeout(() => sendNextQuestion(io, gameId), 2000);

      } catch (error) {
        console.error("Erro ao iniciar o jogo:", error);
      }
    });

    socket.on('player:answer', ({ gameId, playerGameId, questionId, answerId }) => {
      const game = activeGames.get(gameId);
      if (!game) return;

      const question = game.questions.find(q => q.id === questionId);
      if (!question) return;

      const correctAnswer = question.answers.find(a => a.is_correct);
      const isCorrect = correctAnswer.id === answerId;
      
      let pointsEarned = 0;
      if (isCorrect) {
        pointsEarned = 1000; 
      }

      if (!game.players[playerGameId]) {
        const nickname = "Jogador"; 
        game.players[playerGameId] = { id: playerGameId, nickname, score: 0 };
      }
      game.players[playerGameId].score += pointsEarned;
      
      socket.emit('player:answerResult', { 
        isCorrect,
        newTotalScore: game.players[playerGameId].score 
      });

      io.to(`host_${gameId}`).emit('player:answeredUpdate', { 

       });
    });

    socket.on('game:next', ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (game) {
        game.currentQuestionIndex++;
        sendNextQuestion(io, gameId);
      }
    });

    socket.on('disconnect', () => {
    });
  });
}

module.exports = { initializeGameSockets };