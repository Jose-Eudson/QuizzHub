const express = require('express');
const router = express.Router();
const questionController = require('./questionController');
const autenticar = require('../user/authMiddleware');

router.post('/:quizId/perguntas', autenticar, questionController.adicionarPergunta);
router.get('/:quizId/perguntas', questionController.listarPerguntas);
router.put('/perguntas/:questionId', autenticar, questionController.atualizarPergunta);
router.delete('/perguntas/:questionId', autenticar, questionController.deletarPergunta);

module.exports = router;
