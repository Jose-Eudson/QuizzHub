const pool = require('../db');

const activeGames = new Map();

async function sendNextQuestion(io, gameId) {
    const game = activeGames.get(gameId);
    if (!game) return;

    if (game.currentQuestionIndex >= game.questions.length) {
        const finalRanking = Object.values(game.players).sort((a, b) => b.score - a.score);
        io.to(`game_${gameId}`).emit('game:finished', { finalRanking });

        clearTimeout(game.questionTimer);
        activeGames.delete(gameId);
        await pool.query("UPDATE games SET status = 'finished', ended_at = NOW() WHERE id = ?", [gameId]);
        console.log(`Jogo ${gameId} finalizado e limpo da memória.`);
        return;
    }
    
    game.answerCount = 0;

    const question = game.questions[game.currentQuestionIndex];
    const questionForPlayers = {
        id: question.id,
        question_text: question.question_text,
        answers: question.answers.map(a => ({ id: a.id, answer_text: a.answer_text })),
    };

    io.to(`game_${gameId}`).emit('game:nextQuestion', {
        question: questionForPlayers,
        questionIndex: game.currentQuestionIndex,
        totalQuestions: game.questions.length
    });
    
    game.currentQuestionIndex++;
    
    game.questionTimer = setTimeout(() => {
        sendNextQuestion(io, gameId);
    }, 15000);
}

function initializeGameSockets(io) {
    io.on('connection', (socket) => {
        console.log(`Socket conectado: ${socket.id}`);

        socket.on('host:join', (data) => {
            const gameId = parseInt(data.gameId, 10);
            if (isNaN(gameId)) return;

            socket.join(`host_${gameId}`);
            socket.join(`game_${gameId}`);
            if (!activeGames.has(gameId)) {
                activeGames.set(gameId, {
                    players: {},
                    questions: [],
                    currentQuestionIndex: 0,
                    questionTimer: null,
                    answerCount: 0
                });
            }
            console.log(`Host ${socket.id} entrou na sala do jogo ${gameId}.`);
        });

        socket.on('player:join', (data) => {
            const gameId = parseInt(data.gameId, 10);
            const { nickname, playerGameId } = data;
            if (isNaN(gameId)) return;

            socket.join(`game_${gameId}`);
            const game = activeGames.get(gameId);
            if (game && typeof game.players === 'object' && !game.players[playerGameId]) {
                game.players[playerGameId] = { id: playerGameId, nickname, score: 0 };
                io.to(`host_${gameId}`).emit('player:joined', game.players[playerGameId]);
            }
            console.log(`Jogador ${nickname} (${socket.id}) entrou no jogo ${gameId}`);
        });

        socket.on('game:start', async (data) => {
            const gameId = parseInt(data.gameId, 10);
            if (isNaN(gameId)) return;
            
            try {
                const game = activeGames.get(gameId);
                if (!game) throw new Error(`Jogo ${gameId} não encontrado na memória.`);

                const [gameRows] = await pool.query("SELECT quiz_id FROM games WHERE id = ?", [gameId]);
                if (gameRows.length === 0) throw new Error("Jogo não encontrado no DB.");
                const quizId = gameRows[0].quiz_id;

                const [questionRows] = await pool.query(`
                    SELECT 
                        ques.id AS question_id, ques.question_text, ques.points,
                        ans.id AS answer_id, ans.answer_text, ans.is_correct
                    FROM questions ques
                    LEFT JOIN answers ans ON ques.id = ans.question_id
                    WHERE ques.quiz_id = ?
                    ORDER BY ques.id, ans.id
                `, [quizId]);

                if (questionRows.length === 0 || !questionRows[0].question_id) {
                    io.to(`host_${gameId}`).emit('game:error', { message: 'Erro: Este quiz não contém perguntas.' });
                    return;
                }

                const questionMap = new Map();
                for (const row of questionRows) {
                    if (!questionMap.has(row.question_id)) {
                        questionMap.set(row.question_id, {
                            id: row.question_id,
                            question_text: row.question_text,
                            points: row.points,
                            answers: [],
                            correctAnswerId: null
                        });
                    }
                    if (row.answer_id) {
                        const question = questionMap.get(row.question_id);
                        question.answers.push({ id: row.answer_id, answer_text: row.answer_text });
                        if (row.is_correct) {
                            question.correctAnswerId = row.answer_id;
                        }
                    }
                }

                game.questions = Array.from(questionMap.values());
                game.currentQuestionIndex = 0;
                
                await pool.query("UPDATE games SET status = 'in_progress' WHERE id = ?", [gameId]);
                io.to(`game_${gameId}`).emit('game:started');
                console.log(`Jogo ${gameId} iniciado para ${Object.keys(game.players).length} jogadores.`);

                setTimeout(() => sendNextQuestion(io, gameId), 1500);

            } catch (error) {
                console.error("Erro ao iniciar o jogo:", error);
                io.to(`host_${gameId}`).emit('game:error', { message: 'Ocorreu um erro interno ao iniciar o jogo.' });
            }
        });

        socket.on('player:answer', async (data) => {
            const gameId = parseInt(data.gameId, 10);
            const { playerGameId, questionId, answerId } = data;
            if (isNaN(gameId)) return;

            const game = activeGames.get(gameId);
            if (!game || !game.players || !game.players[playerGameId] || game.currentQuestionIndex === 0) return;

            const currentQuestion = game.questions[game.currentQuestionIndex - 1];
            if (!currentQuestion || currentQuestion.id !== questionId) return;

            if(game.answerCount !== undefined) {
                game.answerCount++;
            }

            let pointsEarned = 0;
            if (answerId === currentQuestion.correctAnswerId) {
                pointsEarned = currentQuestion.points || 10;
            }

            game.players[playerGameId].score += pointsEarned;
            
            await pool.query(
                'INSERT INTO scores (player_game_id, question_id, answer_id, points_earned) VALUES (?, ?, ?, ?)',
                [playerGameId, questionId, answerId, pointsEarned]
            );

            io.to(`host_${gameId}`).emit('player:answeredUpdate', {
                answeredCount: game.answerCount,
                totalPlayers: Object.keys(game.players).length
            });
        });

        socket.on('disconnect', () => {
            console.log(`Socket desconectado: ${socket.id}`);
        });
    });
}

module.exports = { initializeGameSockets };