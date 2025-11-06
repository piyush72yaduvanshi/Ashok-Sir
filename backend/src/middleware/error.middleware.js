exports.errorHandler = (err, _req, res, _next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

exports.notFound = (_req, res, _next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
