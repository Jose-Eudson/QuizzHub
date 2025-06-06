const express = require('express');
const router = express.Router();
// O 'require' agora traz a função factory
const gameControllerFactory = require('./gameController');
const autenticar = require('../user/authMiddleware');

// Este arquivo também exporta uma função que recebe 'io'
const initializeGameRoutes = (io) => {
  // Cria a instância do controller, injetando o 'io'
  const gameController = gameControllerFactory(io);

  router.post('/host', autenticar, gameController.hostGame);
  router.post('/join', gameController.joinGame);

  // Retorna o router configurado
  return router;
};

module.exports = initializeGameRoutes;