const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

const users = [
  { id: 1, username: 'reddy70007', passwordHash: bcrypt.hashSync('password123', 8) }
];

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    res.json(decoded);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => console.log(`user-service running on port ${PORT}`));
