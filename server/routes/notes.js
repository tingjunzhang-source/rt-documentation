const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const state = require('../db/state');

// GET /api/notes/draft?participant_id=X&date=YYYY-MM-DD
router.get('/draft', async (req, res) => {
  const { participant_id, date } = req.query;
  if (!participant_id || !date) {
    return res.status(400).json({ error: 'Missing participant_id or date.' });
  }

  if (db.isConnected()) {
    try {
      const rows = await db.query(
        "SELECT form_data FROM daily_notes WHERE participant_id = ? AND note_date = ? AND status = 'draft' LIMIT 1",
        [participant_id, date]
      );
      const formData = rows.length > 0 && rows[0].form_data ? JSON.parse(rows[0].form_data) : null;
      return res.json({ draft: formData });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const key = `${participant_id}_${date}`;
  const raw = state.drafts[key];
  res.json({ draft: raw ? JSON.parse(raw) : null });
});

// POST /api/notes — save draft or final note
router.post('/', async (req, res) => {
  const { participant_id, note_date, note_text, status = 'final', form_data } = req.body;
  if (!participant_id || !note_date || !note_text) {
    return res.status(400).json({ error: 'Missing required fields: participant_id, note_date, note_text.' });
  }

  if (db.isConnected()) {
    try {
      if (status === 'draft') {
        // Upsert: delete existing draft then insert new one
        await db.query(
          "DELETE FROM daily_notes WHERE participant_id = ? AND note_date = ? AND status = 'draft'",
          [participant_id, note_date]
        );
        await db.query(
          "INSERT INTO daily_notes (participant_id, note_date, note_text, status, form_data) VALUES (?, ?, ?, 'draft', ?)",
          [participant_id, note_date, note_text, form_data ? JSON.stringify(form_data) : null]
        );
      } else {
        // Final: remove any draft, then insert final note
        await db.query(
          "DELETE FROM daily_notes WHERE participant_id = ? AND note_date = ? AND status = 'draft'",
          [participant_id, note_date]
        );
        await db.query(
          "INSERT INTO daily_notes (participant_id, note_date, note_text, status) VALUES (?, ?, ?, 'final')",
          [participant_id, note_date, note_text]
        );
      }
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // In-memory fallback
  const key = `${participant_id}_${note_date}`;
  if (status === 'draft') {
    state.drafts[key] = JSON.stringify(form_data || {});
  } else {
    delete state.drafts[key];
    state.finalNotes.push({
      id: state.nextNoteId++,
      participant_id,
      note_date,
      note_text,
      status: 'final',
      created_at: new Date(),
    });
  }
  res.json({ success: true });
});

// GET /api/notes?date=YYYY-MM-DD — all finalized notes for a day
router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing query param: date (YYYY-MM-DD).' });

  if (db.isConnected()) {
    try {
      const notes = await db.query(
        `SELECT n.id, n.note_date, n.note_text, n.created_at, p.name AS participant_name
         FROM daily_notes n
         JOIN participants p ON p.id = n.participant_id
         WHERE n.note_date = ? AND n.status = 'final'
         ORDER BY p.name ASC`,
        [date]
      );
      return res.json(notes);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.json(state.finalNotes.filter((n) => n.note_date === date));
});

module.exports = router;
