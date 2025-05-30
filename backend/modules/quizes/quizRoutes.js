const express = require('express');
const router = express.Router();
const quizController = require('./quizController');
const autenticar = require('../user/authMiddleware');
const isAdmin = require('../user/adminMiddleware');

router.post('/', autenticar, isAdmin, quizController.criarQuiz);
router.get('/', quizController.listarQuizzes);
router.get('/:id', quizController.obterQuiz);
router.put('/:id', autenticar, quizController.atualizarQuiz);
router.delete('/:id', autenticar, quizController.deletarQuiz);

module.exports = router;
