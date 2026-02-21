const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const app = express();
const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } }); // 4MB

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '400mb' }));
app.use(express.static(__dirname));

// שמירת תוכן דפים (כולל גלריה)
app.post('/api/save-page', (req, res) => {
  const { page, data } = req.body;
  fs.writeFileSync(path.join(DATA_DIR, `${page}.json`), data, 'utf8');
  res.json({ success: true });
});

// טעינת תוכן דפים (כולל גלריה)
app.get('/api/page/:page', (req, res) => {
  const page = req.params.page;
  const file = path.join(DATA_DIR, `${page}.json`);
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json({});
  }
});

// שמירת פניות צור קשר
app.post('/api/contact', (req, res) => {
  const contactsFile = path.join(DATA_DIR, 'contacts.json');
  let contacts = [];
  if (fs.existsSync(contactsFile)) {
    contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  }
  contacts.push(req.body);
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2), 'utf8');
  res.json({ success: true });
});

// קבלת כל הפניות
app.get('/api/contacts', (req, res) => {
  const contactsFile = path.join(DATA_DIR, 'contacts.json');
  if (fs.existsSync(contactsFile)) {
    res.json(JSON.parse(fs.readFileSync(contactsFile, 'utf8')));
  } else {
    res.json([]);
  }
});

// מחיקת פנייה לפי אינדקס
app.delete('/api/contacts/:idx', (req, res) => {
  const contactsFile = path.join(DATA_DIR, 'contacts.json');
  if (!fs.existsSync(contactsFile)) return res.json({ success: false });
  let contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  const idx = parseInt(req.params.idx, 10);
  if (isNaN(idx) || idx < 0 || idx >= contacts.length) return res.json({ success: false });
  contacts.splice(idx, 1);
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2), 'utf8');
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});