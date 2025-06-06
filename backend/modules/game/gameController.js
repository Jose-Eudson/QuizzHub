const pool = require('../db');

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const gameController = (io) => {

  const hostGame = async (req, res) => {
    try {
      const { quizId } = req.body;
      const hostId = req.usuario.id;

      if (!quizId) {
        return res.status(400).json({ mensagem: 'O ID do Quiz é obrigatório.' });
      }

      const pin = generatePin();
      const [result] = await pool.query(
        'INSERT INTO games (quiz_id, host_id, pin, status) VALUES (?, ?, ?, ?)',
        [quizId, hostId, pin, 'waiting']
      );
      const gameId = result.insertId;

      res.status(201).json({
        mensagem: 'Jogo criado com sucesso! Compartilhe o PIN com os jogadores.',
        gameId,
        pin
      });
    } catch (error) {
      console.error('Erro ao hospedar jogo:', error);
      res.status(500).json({ mensagem: 'Erro interno ao hospedar o jogo.' });
    }
  };

  const joinGame = async (req, res) => {
    try {
      const { pin, nickname } = req.body;
      if (!pin || !nickname) {
        return res.status(400).json({ mensagem: 'PIN e Nickname são obrigatórios.' });
      }

      const [games] = await pool.query('SELECT id, status FROM games WHERE pin = ?', [pin]);
      if (games.length === 0) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado com este PIN.' });
      }
      
      const game = games[0];
      if (game.status !== 'waiting') {
        return res.status(403).json({ mensagem: 'Este jogo não está mais aceitando jogadores.' });
      }

      const [result] = await pool.query(
        'INSERT INTO player_games (game_id, nickname) VALUES (?, ?)',
        [game.id, nickname]
      );
      const player = { id: result.insertId, nickname: nickname, score: 0 };

      // Usando o 'io' injetado para emitir o evento
      io.to(`host_${game.id}`).emit('player:joined', player);
      
      res.status(200).json({
        mensagem: 'Você entrou no jogo!',
        gameId: game.id,
        playerGameId: player.id,
        nickname: player.nickname
      });
    } catch (error) {
      console.error('Erro ao entrar no jogo:', error);
      res.status(500).json({ mensagem: 'Erro interno ao entrar no jogo.' });
    }
  };

  return {
    hostGame,
    joinGame
  };
};

module.exports = gameController;