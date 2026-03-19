const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { upload, uploadAvatar } = require('../middleware/upload');
const db = require('../db/connection');
const state = require('../db/state');

// In-memory fallback when no DB is connected
let memNextId = 11;
let memParticipants = [
  { id: 1,  name: 'Chen, Meihua (陈美华)',   avatar_url: '/avatars/chen-meihua.svg',   done: false },
  { id: 2,  name: 'Huang, Yulan (黄玉兰)',    avatar_url: '/avatars/huang-yulan.svg',   done: false },
  { id: 3,  name: 'Li, Jianguo (李建国)',     avatar_url: '/avatars/li-jianguo.svg',    done: false },
  { id: 4,  name: 'Lin, Daming (林大明)',     avatar_url: '/avatars/lin-daming.svg',    done: false },
  { id: 5,  name: 'Liu, Xiuying (刘秀英)',    avatar_url: '/avatars/liu-xiuying.svg',   done: false },
  { id: 6,  name: 'Wang, Shufen (王淑芬)',    avatar_url: '/avatars/wang-shufen.svg',   done: false },
  { id: 7,  name: 'Wu, Guihua (吴桂花)',      avatar_url: '/avatars/wu-guihua.svg',     done: false },
  { id: 8,  name: 'Zhang, Zhiyuan (张志远)',  avatar_url: '/avatars/zhang-zhiyuan.svg', done: false },
  { id: 9,  name: 'Zhao, Guoqiang (赵国强)',  avatar_url: '/avatars/zhao-guoqiang.svg', done: false },
  { id: 10, name: 'Zhou, Wenjing (周文静)',   avatar_url: '/avatars/zhou-wenjing.svg',  done: false },
];

// GET /api/participants
router.get('/', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  if (db.isConnected()) {
    try {
      const participants = await db.query(
        'SELECT id, name, avatar_url FROM participants WHERE active = true ORDER BY name ASC'
      );
      const finalRows = await db.query(
        "SELECT DISTINCT participant_id FROM daily_notes WHERE note_date = ? AND status = 'final'",
        [today]
      );
      const draftRows = await db.query(
        "SELECT DISTINCT participant_id FROM daily_notes WHERE note_date = ? AND status = 'draft'",
        [today]
      );
      const doneSet = new Set(finalRows.map((r) => r.participant_id));
      const draftSet = new Set(draftRows.map((r) => r.participant_id));
      return res.json(participants.map((p) => ({
        ...p,
        status: doneSet.has(p.id) ? 'done' : draftSet.has(p.id) ? 'in_progress' : 'pending',
      })));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // In-memory: derive status from shared state
  const sorted = [...memParticipants].sort((a, b) => a.name.localeCompare(b.name));
  res.json(sorted.map((p) => {
    const isDone = state.finalNotes.some((n) => n.participant_id === p.id && n.note_date === today);
    const isDraft = !!state.drafts[`${p.id}_${today}`];
    return { ...p, status: isDone ? 'done' : isDraft ? 'in_progress' : 'pending' };
  }));
});

// POST /api/participants/upload — CSV import
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    const names = records
      .map((r) => r.name || r.Name || r.full_name || r.FullName || Object.values(r)[0])
      .filter(Boolean)
      .map((n) => String(n).trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      return res.status(400).json({ error: 'No names found. Ensure your CSV has a "name" column.' });
    }

    if (db.isConnected()) {
      for (const name of names) {
        await db.query(
          'INSERT INTO participants (name, active) VALUES (?, true) ON DUPLICATE KEY UPDATE active = true',
          [name]
        ).catch(() =>
          db.query('INSERT INTO participants (name, active) VALUES (?, true)', [name])
        );
      }
    } else {
      for (const name of names) {
        if (!memParticipants.find((p) => p.name === name)) {
          memParticipants.push({ id: memNextId++, name, avatar_url: null, done: false });
        }
      }
    }

    fs.unlinkSync(req.file.path);
    res.json({ imported: names.length, names });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/participants/db-connect
router.post('/db-connect', async (req, res) => {
  const { type, host, port, user, password, database } = req.body;
  if (!type || !host || !user || !database) {
    return res.status(400).json({ error: 'Missing required fields: type, host, user, database.' });
  }
  try {
    await db.connect({ type, host, port, user, password, database });
    res.json({ success: true, message: `Connected to ${type} database "${database}" on ${host}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/participants/:id/avatar — upload a profile photo
router.post('/:id/avatar', uploadAvatar.single('file'), async (req, res) => {
  const id = Number(req.params.id);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const ext = path.extname(req.file.filename).toLowerCase();
  const avatarUrl = `/avatars/uploads/participant-${id}${ext}`;

  // Delete old avatar files for this participant (any extension)
  const uploadsDir = path.join(__dirname, '../public/avatars/uploads');
  for (const f of fs.readdirSync(uploadsDir)) {
    if (f.startsWith(`participant-${id}.`) && f !== path.basename(req.file.path)) {
      try { fs.unlinkSync(path.join(uploadsDir, f)); } catch {}
    }
  }

  if (db.isConnected()) {
    try {
      await db.query('UPDATE participants SET avatar_url = ? WHERE id = ?', [avatarUrl, id]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const p = memParticipants.find((p) => p.id === id);
    if (p) p.avatar_url = avatarUrl;
  }

  res.json({ success: true, avatar_url: avatarUrl });
});

// DELETE /api/participants/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (db.isConnected()) {
    try {
      await db.query('UPDATE participants SET active = false WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  memParticipants = memParticipants.filter((p) => p.id !== Number(id));
  res.json({ success: true });
});

module.exports = router;
