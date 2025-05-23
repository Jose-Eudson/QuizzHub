const express = require('express');
const router = express.Router();
const authController = require('./authController');
const autenticar = require('./authMiddleware');

// Rota de registro
router.post('/registrar', authController.registrar);

// Rota de login
router.post('/login', authController.login);

// Rota de perfil (protegida)
router.get('/perfil', autenticar, authController.perfil);

module.exports = router;