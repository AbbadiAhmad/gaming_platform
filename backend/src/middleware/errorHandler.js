export default function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ error: 'Database constraint violation' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
