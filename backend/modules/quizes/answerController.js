const pool = require('../db');

// Adicionar resposta a uma pergunta
const adicionarResposta = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer_text, is_correct } = req.body;
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
      return res.status(403).json({ mensagem: 'Você não tem permissão para adicionar respostas a esta pergunta' });
    }

    const [result] = await pool.query(
      'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
      [questionId, answer_text, is_correct || false]
    );

    res.status(201).json({
      mensagem: 'Resposta adicionada com sucesso',
      answerId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao adicionar resposta' });
  }
};

// Listar respostas de uma pergunta
const listarRespostas = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const [answers] = await pool.query(
      'SELECT id, answer_text FROM answers WHERE question_id = ?',
      [questionId]
    );
    
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar respostas' });
  }
};

// Atualizar resposta
const atualizarResposta = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { answer_text, is_correct } = req.body;
    const userId = req.usuario.id;

    // Verificar se a resposta pertence ao usuário
    const [answer] = await pool.query(`
      SELECT q.creator_id 
      FROM answers a
      JOIN questions p ON a.question_id = p.id
      JOIN quizzes q ON p.quiz_id = q.id
      WHERE a.id = ?
    `, [answerId]);
    
    if (answer.length === 0) {
      return res.status(404).json({ mensagem: 'Resposta não encontrada' });
    }
    
    if (answer[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar esta resposta' });
    }

    await pool.query(
      'UPDATE answers SET answer_text = ?, is_correct = ? WHERE id = ?',
      [answer_text, is_correct, answerId]
    );
    
    res.json({ mensagem: 'Resposta atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar resposta' });
  }
};

// Deletar resposta
const deletarResposta = async (req, res) => {
  try {
    const { answerId } = req.params;
    const userId = req.usuario.id;

    // Verificar se a resposta pertence ao usuário
    const [answer] = await pool.query(`
      SELECT q.creator_id 
      FROM answers a
      JOIN questions p ON a.question_id = p.id
      JOIN quizzes q ON p.quiz_id = q.id
      WHERE a.id = ?
    `, [answerId]);
    
    if (answer.length === 0) {
      return res.status(404).json({ mensagem: 'Resposta não encontrada' });
    }
    
    if (answer[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para deletar esta resposta' });
    }

    await pool.query('DELETE FROM answers WHERE id = ?', [answerId]);
    
    res.json({ mensagem: 'Resposta deletada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar resposta' });
  }
};

module.exports = {
  adicionarResposta,
  listarRespostas,
  atualizarResposta,
  deletarResposta
};
