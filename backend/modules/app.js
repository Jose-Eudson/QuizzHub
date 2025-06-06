const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Remova a exportação de 'io' daqui
// module.exports.io = io; 

// Rotas e Sockets
const authRoutes = require('./user/authRoutes');
const quizRoutes = require('./quizes/quizRoutes');
const initializeGameRoutes = require('./game/gameRoutes'); // Importa a função de inicialização
const { initializeGameSockets } = require('./game/gameSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicializa os módulos que dependem de 'io', passando o objeto 'io'
initializeGameSockets(io);
const gameRoutes = initializeGameRoutes(io); // Cria as rotas do jogo

// Use as rotas
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/games', gameRoutes); // Usa o router retornado

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});