const multer = require('multer');
const path = require('path');
const fs = require('fs');

// CSV upload — temp storage
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are accepted.'));
    }
  },
});

// Avatar image upload — saved to public/avatars/uploads/
const avatarDir = path.join(__dirname, '../public/avatars/uploads');
fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `participant-${req.params.id}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are accepted.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { upload, uploadAvatar };
