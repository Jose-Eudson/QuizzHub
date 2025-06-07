const express = require('express');
const router = express.Router();
const authController = require('./authController');
const autenticar = require('./authMiddleware');

router.post('/registrar', authController.registrar);

router.post('/login', authController.login);

router.get('/perfil', autenticar, authController.perfil);
// Adicione esta rota para buscar o histórico do usuário autenticado
router.get('/history', autenticar, async (req, res) => {
    try {
        const username = req.usuario.username; // Supondo que o nickname no jogo seja o username
        const [history] = await pool.query(`
            SELECT q.title AS quizTitle, SUM(s.points_earned) AS score, g.ended_at AS date
            FROM scores s
            JOIN player_games pg ON s.player_game_id = pg.id
            JOIN games g ON pg.game_id = g.id
            JOIN quizzes q ON g.quiz_id = q.id
            WHERE pg.nickname = ?
            GROUP BY g.id, q.title
            ORDER BY g.ended_at DESC;
        `, [username]);
        res.json(history);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar o histórico.' });
    }
});

// Adicione esta rota para o ranking global
router.get('/ranking', async (req, res) => {
    try {
        const [ranking] = await pool.query(`
            SELECT pg.nickname, SUM(s.points_earned) as total_score
            FROM scores s
            JOIN player_games pg ON s.player_game_id = pg.id
            GROUP BY pg.nickname
            ORDER BY total_score DESC
            LIMIT 10;
        `);
        res.json(ranking);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar o ranking.' });
    }
});

module.exports = router;