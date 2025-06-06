const express = require('express');
const router = express.Router({ mergeParams: true }); 
const questionController = require('./questionController');
const answerRoutes = require('./answerRoutes'); 
const autenticar = require('../user/authMiddleware');

// Rotas relativas a /api/quizzes/:quizId/questions
router.post('/', autenticar, questionController.adicionarPergunta);
router.put('/:questionId', autenticar, questionController.atualizarPergunta);
router.delete('/:questionId', autenticar, questionController.deletarPergunta);

router.use('/:questionId/answers', answerRoutes);

module.exports = router;