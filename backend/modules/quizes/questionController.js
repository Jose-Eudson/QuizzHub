const pool = require('../db');

const adicionarPergunta = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question_text, points } = req.body;
    const userId = req.usuario.id;

    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para adicionar perguntas a este quiz' });
    }

    const [result] = await pool.query(
      'INSERT INTO questions (quiz_id, question_text, points) VALUES (?, ?, ?)',
      [quizId, question_text, points || 10]
    );

    const newQuestionId = result.insertId;

    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [newQuestionId]);
    
    res.status(201).json(rows[0]);

  } catch (error) {
    console.error("Erro em adicionarPergunta:", error);
    res.status(500).json({ mensagem: 'Erro interno ao adicionar pergunta' });
  }
};

const atualizarPergunta = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { question_text, points } = req.body;
    const userId = req.usuario.id;

    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar esta pergunta' });
    }

    await pool.query(
      'UPDATE questions SET question_text = ?, points = ? WHERE id = ? AND quiz_id = ?',
      [question_text, points, questionId, quizId]
    );
    
    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [questionId]);
    
    res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Erro em atualizarPergunta:", error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar pergunta' });
  }
};

const deletarPergunta = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const userId = req.usuario.id;

    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para deletar esta pergunta' });
    }

    await pool.query('DELETE FROM questions WHERE id = ? AND quiz_id = ?', [questionId, quizId]);
    
    res.status(200).json({ mensagem: 'Pergunta deletada com sucesso' });
  } catch (error) {
    console.error("Erro em deletarPergunta:", error);
    res.status(500).json({ mensagem: 'Erro interno ao deletar pergunta' });
  }
};

module.exports = {
  adicionarPergunta,
  atualizarPergunta,
  deletarPergunta
};