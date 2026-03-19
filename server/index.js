require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const participantRoutes = require('./routes/participants');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));

app.use('/api/participants', participantRoutes);
app.use('/api/notes', notesRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`RT Documentation server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
