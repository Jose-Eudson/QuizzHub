const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const registrar = async (req, res) => {
  try {
    const { username, email, senha, role } = req.body;

    if (!username || !email || !senha || !role) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({ mensagem: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao registrar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ mensagem: 'Nome de usuário ou senha inválidos' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ mensagem: 'Nome de usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
};

const perfil = async (req, res) => {
  try {
    const usuario = req.usuario;

    res.json({
      id: usuario.id,
      username: usuario.username, 
      email: usuario.email,
      role: usuario.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao acessar perfil' });
  }
};

module.exports = { registrar, login, perfil };