const express = require("express");
const path = require("path");
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');

const app = express();
const PORT = 3000;

/* ---------- Middleware ---------- */

// Server Static filer fra public
app.use(express.static(path.join(__dirname, "public")));

// Til ejs templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Validering og sanitizing af data fra klient
function validateAndSanitizeData(req, res, next) {
    try {
        // Data fra klient
        const data = req.body;

        // Validering af data
        if (typeof data.name !== 'string' || data.name.trim().length === 0) {
            return res.status(400).render('error-page', { message: 'Ugyldigt navn' });
        }
        const age = Number(data.age);
        if (!Number.isInteger(age) || age < 0 || age > 120) {
            return res.status(400).render('error-page', { message: 'Ugyldig alder' });
        }
        if (typeof data.address !== 'string' || data.address.trim().length === 0) {
            return res.status(400).render('error-page', { message: 'Ugyldig adresse' });
        }

        // Sanitizér data for OND kode
        req.sanitizedData = {
            name: sanitizeHtml(data.name.trim(), {
                allowedTags: [], // ingen html tags tilladt
                allowedAttributes: {}, // ingen attributes tilladt
                nonTextTags: [] // alle tags må gerne have tekst inde i sig (man kan se, hvad der er skrevet inde i tags)
            }),
            age: age,
            address: sanitizeHtml(data.address.trim(), {
                allowedTags: [],
                allowedAttributes: {},
                nonTextTags: []
            })
        }

        next();

    } catch (err) {
        console.error('Fejl i validering:', err);
        res.status(500).render('error-page', { message: 'Serverfejl' });
    }
}

/* ---------- Routes ---------- */

app.post('/send-data', validateAndSanitizeData, (req, res) => {
    try {
        const data = req.sanitizedData; // er blevet valideret og sanitized i middleware

        // Gem data i database (json-fil)
        fs.writeFileSync(
            path.join(__dirname, 'database', 'data.json'),
            JSON.stringify(data, null, 2)
        );

        // Render pesonlig side med oplysninger
        res.render('personal-page', { data });

    } catch (err) {
        console.error('fejl ved data gemning:', err);

        // Send fejl til klient
        res.status(500).render('error-page', { message: 'Serverfejl' });
    }
})

app.get('/personal-page', (req, res) => {
    // Filsti til data
    const dataFilePath = path.join(__dirname, 'database', 'data.json');

    // Tjek om data findes og render hvis det gør
    if (fs.existsSync(dataFilePath)) {
        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        res.render('personal-page', { data });
    } else {
        res.status(404).render('error-page', { message: 'Ingen personlige informationer gemt' });
    }
})

app.delete('/delete-info', (req, res) => {
    // Filsti til data
    const dataFilePath = path.join(__dirname, 'database', 'data.json');

    // Tjek om data findes og slet hvis det gør
    if (fs.existsSync(dataFilePath)) {
        fs.unlinkSync(dataFilePath); // slet filen
        res.status(200).send('Info slettet');
    } else {
        res.status(404).send('Ingen info at slette');
    }
})

/* ---------- Server ---------- */

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});


