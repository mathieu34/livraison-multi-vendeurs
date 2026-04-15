const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] ${status} - ${message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
