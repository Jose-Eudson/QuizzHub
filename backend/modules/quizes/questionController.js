const pool = require('../db');

// Adicionar pergunta a um quiz
const adicionarPergunta = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question_text, time_limit, points } = req.body;
    const userId = req.usuario.id;

    // Verificar se o quiz pertence ao usuário
    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
    
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para adicionar perguntas a este quiz' });
    }

    const [result] = await pool.query(
      'INSERT INTO questions (quiz_id, question_text, time_limit, points) VALUES (?, ?, ?, ?)',
      [quizId, question_text, time_limit || 30, points || 10]
    );

    res.status(201).json({
      mensagem: 'Pergunta adicionada com sucesso',
      questionId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao adicionar pergunta' });
  }
};

// Listar perguntas de um quiz
const listarPerguntas = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const [questions] = await pool.query(
      'SELECT * FROM questions WHERE quiz_id = ?',
      [quizId]
    );
    
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar perguntas' });
  }
};

// Atualizar pergunta
const atualizarPergunta = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question_text, time_limit, points } = req.body;
    const userId = req.usuario.id;

    // Verificar se a pergunta pertence ao usuário
    const [question] = await pool.query(`
      SELECT q.creator_id 
      FROM questions p
      JOIN quizzes q ON p.quiz_id = q.id
      WHERE p.id = ?
    `, [questionId]);
    
    if (question.length === 0) {
      return res.status(404).json({ mensagem: 'Pergunta não encontrada' });
    }
    
    if (question[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar esta pergunta' });
    }

    await pool.query(
      'UPDATE questions SET question_text = ?, time_limit = ?, points = ? WHERE id = ?',
      [question_text, time_limit, points, questionId]
    );
    
    res.json({ mensagem: 'Pergunta atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar pergunta' });
  }
};

// Deletar pergunta
const deletarPergunta = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.usuario.id;

    // Verificar se a pergunta pertence ao usuário
    const [question] = await pool.query(`
      SELECT q.creator_id 
      FROM questions p
      JOIN quizzes q ON p.quiz_id = q.id
      WHERE p.id = ?
    `, [questionId]);
    
    if (question.length === 0) {
      return res.status(404).json({ mensagem: 'Pergunta não encontrada' });
    }
    
    if (question[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para deletar esta pergunta' });
    }

    await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);
    
    res.json({ mensagem: 'Pergunta deletada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar pergunta' });
  }
};

module.exports = {
  adicionarPergunta,
  listarPerguntas,
  atualizarPergunta,
  deletarPergunta
};
