const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./data/sessions.db', (err) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log('Connected to the sessions database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fio TEXT,
    group_name TEXT,
    subject TEXT,
    grade INTEGER
  )`);
});

app.get('/sessions', (req, res) => {
  db.all('SELECT * FROM sessions', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/sessions', (req, res) => {
  const { fio, group, subject, grade } = req.body;

  db.run(
    'INSERT INTO sessions (fio, group_name, subject, grade) VALUES (?, ?, ?, ?)',
    [fio, group, subject, grade],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.get('/sessions/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      res.json(row);
    }
  });
});

app.put('/sessions/:id', (req, res) => {
  const id = req.params.id;
  const { fio, group, subject, grade } = req.body;

  db.run(
    'UPDATE sessions SET fio = ?, group_name = ?, subject = ?, grade = ? WHERE id = ?',
    [fio, group, subject, grade, id],
    (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.sendStatus(200);
      }
    }
  );
});

app.delete('/sessions/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM sessions WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.sendStatus(200);
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
