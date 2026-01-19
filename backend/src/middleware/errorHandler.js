const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.message
    });
  }

  if (err.code === '23505') { // Código PostgreSQL para violação de unique
    return res.status(400).json({
      error: 'Registro duplicado'
    });
  }

  res.status(500).json({
    error: 'Erro interno do servidor'
  });
};

module.exports = errorHandler;