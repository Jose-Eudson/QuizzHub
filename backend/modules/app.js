const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./user/authRoutes');
const quizRoutes = require('./quizes/quizRoutes');
const questionRoutes = require('./quizes/questionRoutes');
const answerRoutes = require('./quizes/answerRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quizzes', questionRoutes);
app.use('/api/quizzes/perguntas', answerRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
