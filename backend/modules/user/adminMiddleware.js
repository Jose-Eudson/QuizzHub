const isAdmin = (req, res, next) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso restrito a administradores' });
  }
  next();
};

module.exports = isAdmin;