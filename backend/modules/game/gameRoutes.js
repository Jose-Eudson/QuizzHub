const express = require('express');
const router = express.Router();
const gameControllerFactory = require('./gameController');
const autenticar = require('../user/authMiddleware');

const initializeGameRoutes = (io) => {
  const gameController = gameControllerFactory(io);

  router.post('/host', autenticar, gameController.hostGame);
  router.post('/join', gameController.joinGame);

  return router;
};

module.exports = initializeGameRoutes;