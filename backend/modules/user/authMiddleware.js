const jwt = require('jsonwebtoken');
require('dotenv').config();

const autenticar = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar o usuário decodificado ao objeto de requisição
    req.usuario = decoded;
    
    next();
  } catch (error) {
    res.status(400).json({ mensagem: 'Token inválido.' });
  }
};

module.exports = autenticar;