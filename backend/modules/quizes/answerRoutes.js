const express = require('express');
const router = express.Router();
const answerController = require('./answerController');
const autenticar = require('../user/authMiddleware');

router.post('/:questionId/respostas', autenticar, answerController.adicionarResposta);
router.get('/:questionId/respostas', answerController.listarRespostas);
router.put('/:questionId/respostas/:answerId', autenticar, answerController.atualizarResposta);
router.delete('/:questionId/respostas/:answerId', autenticar, answerController.deletarResposta);

module.exports = router;
