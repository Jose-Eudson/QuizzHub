const pool = require('../db');

const adicionarResposta = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { answer_text, is_correct } = req.body;
    const userId = req.usuario.id;

    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
    if (quiz.length === 0) return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para adicionar respostas' });
    }

    const [result] = await pool.query(
      'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
      [questionId, answer_text, is_correct || false]
    );

    res.status(201).json({
      mensagem: 'Resposta adicionada com sucesso',
      id: result.insertId // <-- CORREÇÃO: Usar "id" como chave padrão
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao adicionar resposta' });
  }
};

const atualizarResposta = async (req, res) => {
    try {
        const { quizId, questionId, answerId } = req.params;
        const { answer_text, is_correct } = req.body;
        const userId = req.usuario.id;

        const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
        if (quiz.length === 0) return res.status(404).json({ mensagem: 'Quiz não encontrado' });
        if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
            return res.status(403).json({ mensagem: 'Você não tem permissão para editar esta resposta' });
        }

        await pool.query(
            'UPDATE answers SET answer_text = ?, is_correct = ? WHERE id = ? AND question_id = ?',
            [answer_text, is_correct, answerId, questionId]
        );
        
        res.json({ mensagem: 'Resposta atualizada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao atualizar resposta' });
    }
};

const deletarResposta = async (req, res) => {
    try {
        const { quizId, questionId, answerId } = req.params;
        const userId = req.usuario.id;

        const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [quizId]);
        if (quiz.length === 0) return res.status(404).json({ mensagem: 'Quiz não encontrado' });
        if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
            return res.status(403).json({ mensagem: 'Você não tem permissão para deletar esta resposta' });
        }

        await pool.query('DELETE FROM answers WHERE id = ? AND question_id = ?', [answerId, questionId]);
        
        res.json({ mensagem: 'Resposta deletada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao deletar resposta' });
    }
};

module.exports = {
  adicionarResposta,
  atualizarResposta,
  deletarResposta
};