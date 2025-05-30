const pool = require('../db');

// Criar novo quiz
const criarQuiz = async (req, res) => {
  try {
    const { title, description } = req.body;
    const creatorId = req.usuario.id;

    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, creator_id) VALUES (?, ?, ?)',
      [title, description, creatorId]
    );

    res.status(201).json({
      mensagem: 'Quiz criado com sucesso',
      quizId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao criar quiz' });
  }
};

// Listar todos os quizzes
const listarQuizzes = async (req, res) => {
  try {
    const [quizzes] = await pool.query(`
      SELECT q.*, u.username as creator_name 
      FROM quizzes q
      JOIN users u ON q.creator_id = u.id
    `);
    
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar quizzes' });
  }
};

// Obter quiz específico
const obterQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [quiz] = await pool.query(`
      SELECT q.*, u.username as creator_name 
      FROM quizzes q
      JOIN users u ON q.creator_id = u.id
      WHERE q.id = ?
    `, [id]);
    
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    
    res.json(quiz[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao obter quiz' });
  }
};

// Atualizar quiz
const atualizarQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.usuario.id;

    // Verificar se o quiz pertence ao usuário
    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [id]);
    
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar este quiz' });
    }

    await pool.query(
      'UPDATE quizzes SET title = ?, description = ? WHERE id = ?',
      [title, description, id]
    );
    
    res.json({ mensagem: 'Quiz atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar quiz' });
  }
};

// Deletar quiz
const deletarQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;

    // Verificar se o quiz pertence ao usuário
    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [id]);
    
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para deletar este quiz' });
    }

    await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
    
    res.json({ mensagem: 'Quiz deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar quiz' });
  }
};

module.exports = {
  criarQuiz,
  listarQuizzes,
  obterQuiz,
  atualizarQuiz,
  deletarQuiz
};
