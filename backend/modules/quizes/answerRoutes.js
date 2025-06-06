const express = require('express');
const router = express.Router({ mergeParams: true });
const answerController = require('./answerController');
const autenticar = require('../user/authMiddleware');

router.post('/', autenticar, answerController.adicionarResposta);
router.put('/:answerId', autenticar, answerController.atualizarResposta);
router.delete('/:answerId', autenticar, answerController.deletarResposta);

module.exports = router;