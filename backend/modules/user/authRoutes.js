const express = require('express');
const router = express.Router();
const authController = require('./authController');
const autenticar = require('./authMiddleware');

router.post('/registrar', authController.registrar);

router.post('/login', authController.login);

router.get('/perfil', autenticar, authController.perfil);

module.exports = router;