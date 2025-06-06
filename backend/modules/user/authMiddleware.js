const jwt = require('jsonwebtoken');
require('dotenv').config();

const autenticar = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.usuario = decoded;
    
    next();
  } catch (error) {
    res.status(400).json({ mensagem: 'Token inválido.' });
  }
};

module.exports = autenticar;