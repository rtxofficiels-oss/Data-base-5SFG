const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('uploads'));

const VALID_HASHES = {
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824': true, // admin123
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8': true, // secret456
    'e4da3b7fbbce2345d7772b0674a318d149100219512f428e': true // prive789
};

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(16).toString('hex') + 
                          path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || 
            file.mimetype === 'text/plain' || 
            file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé'));
        }
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    const token = req.body.token;
    
    if (!VALID_HASHES[token]) {
        return res.status(401).json({ error: 'Accès refusé' });
    }
    
    if (!req.file) {
        return res.status(400).json({ error: 'Erreur upload' });
    }
    
    res.json({ 
        success: true, 
        name: req.file.originalname,
        id: req.file.filename,
        url: `https://ton-backend.vercel.app/${req.file.filename}`,
        size: req.file.size 
    });
});

app.get('/files', (req, res) => {
    const token = req.query.token;
    
    if (!VALID_HASHES[token]) {
        return res.status(401).json({ error: 'Accès refusé' });
    }
    
    fs.readdir('./uploads/', (err, files) => {
        if (err) return res.status(500).json({ error: 'Erreur lecture' });
        
        const fileList = files.map(file => ({
            id: file,
            name: file,
            url: `https://ton-backend.vercel.app/${file}`,
            size: fs.statSync(`./uploads/${file}`).size
        }));
        
        res.json(fileList);
    });
});

app.delete('/delete/:id', (req, res) => {
    const token = req.query.token;
    
    if (!VALID_HASHES[token]) {
        return res.status(401).json({ error: 'Accès refusé' });
    }
    
    const filePath = `./uploads/${req.params.id}`;
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Fichier non trouvé' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Serveur démarré');
});
