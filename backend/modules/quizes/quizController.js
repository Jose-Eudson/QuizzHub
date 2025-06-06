const pool = require('../db');

const criarQuiz = async (req, res) => {
  try {
    const { title, description, time_limit, difficulty, category } = req.body;
    const creatorId = req.usuario.id;

    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, creator_id, time_limit, difficulty, category) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, creatorId, time_limit, difficulty, category]
    );

    res.status(201).json({
      mensagem: 'Quiz criado com sucesso',
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao criar quiz' });
  }
};

const atualizarQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time_limit, difficulty, category } = req.body;
    const userId = req.usuario.id;
    
    const [quiz] = await pool.query('SELECT creator_id FROM quizzes WHERE id = ?', [id]);
    
    if (quiz.length === 0) {
      return res.status(404).json({ mensagem: 'Quiz não encontrado' });
    }
    
    if (quiz[0].creator_id !== userId && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar este quiz' });
    }

    await pool.query(
      'UPDATE quizzes SET title = ?, description = ?, time_limit = ?, difficulty = ?, category = ? WHERE id = ?',
      [title, description, time_limit, difficulty, category, id]
    );
    
    res.json({ mensagem: 'Quiz atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar quiz' });
  }
};

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

// Em quizController.js -> obterQuiz
const obterQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        q.id as quiz_id, q.title, q.description, q.creator_id,
        ques.id as question_id, ques.question_text,
        ans.id as answer_id, ans.answer_text, ans.is_correct
      FROM quizzes q
      LEFT JOIN questions ques ON q.id = ques.quiz_id
      LEFT JOIN answers ans ON ques.id = ans.question_id
      WHERE q.id = ?
    `, [id]);

    if (rows.length === 0 || !rows[0].quiz_id) {
      // Se não  linhas ou a primeira linha não tiver um quiz_id, o quiz não existe.
      const [quizCheck] = await pool.query('SELECT id FROM quizzes WHERE id = ?', [id]);
      if(quizCheck.length === 0) {
        return res.status(404).json({ mensagem: 'Quiz não encontrado' });
      }
      const [quizData] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]);
      return res.json({ ...quizData[0], questions: [] });
    }

    const quizMap = new Map();
    const questionMap = new Map();

    for (const row of rows) {
      if (!quizMap.has(row.quiz_id)) {
        quizMap.set(row.quiz_id, {
          id: row.quiz_id,
          title: row.title,
          description: row.description,
          creator_id: row.creator_id,
          questions: []
        });
      }

      if (row.question_id && !questionMap.has(row.question_id)) {
        questionMap.set(row.question_id, {
          id: row.question_id,
          question_text: row.question_text,
          answers: []
        });
      }

      if (row.answer_id) {
        questionMap.get(row.question_id).answers.push({
          id: row.answer_id,
          answer_text: row.answer_text,
          is_correct: row.is_correct
        });
      }
    }

    const quiz = quizMap.get(parseInt(id));
    quiz.questions = Array.from(questionMap.values());

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao obter quiz' });
  }
};

const deletarQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;

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
  atualizarQuiz,
  listarQuizzes,
  obterQuiz,
  deletarQuiz
};