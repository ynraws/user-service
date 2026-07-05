const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

let users = [
  { id: 1, username: 'reddy70007', passwordHash: bcrypt.hashSync('password123', 8) }
];
let nextUserId = 2;

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/login', (req, res) => {
  const { email, username, password } = req.body;
  const identifier = email || username;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  const user = users.find(u => u.username === identifier);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/register', (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;
  const identifier = email || username;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  if (users.find(u => u.username === identifier)) {
    return res.status(409).json({ error: 'Account already exists' });
  }
  const user = {
    id: nextUserId++,
    username: identifier,
    email: email || null,
    firstName: firstName || null,
    lastName: lastName || null,
    passwordHash: bcrypt.hashSync(password, 8)
  };
  users.push(user);
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token });
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

app.listen(PORT, () => console.log('user-service running on port ' + PORT));
