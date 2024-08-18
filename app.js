const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3002;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const cssFolderPath = path.join(__dirname, 'public', 'css');

app.get('/', (req, res) => {
    const lang = req.query.lang || 'et';
    const translations = require(`./locales/${lang}.json`);

    res.render('index', { translations });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});