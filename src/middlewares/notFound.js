function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found', path: req.originalUrl } });
}

module.exports = notFound;