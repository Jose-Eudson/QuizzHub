const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');


const authRoutes = require('./user/authRoutes');
const quizRoutes = require('./quizes/quizRoutes');
const initializeGameRoutes = require('./game/gameRoutes'); 
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

initializeGameSockets(io);
const gameRoutes = initializeGameRoutes(io); 

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/games', gameRoutes);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});