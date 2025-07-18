function setLanguageCookie(language) {
    document.cookie = `language=${language}; path=/; max-age=31536000`;
}

document.getElementById('et-language').addEventListener('click', function () {
    document.cookie = `language=et; path=/; max-age=31536000`;
});

document.getElementById('ru-language').addEventListener('click', function () {
    document.cookie = `language=ru; path=/; max-age=31536000`;
});

const User = require('../models/User');

describe('User Model', () => {
    test('Peaks looma uue kasutaja', () => {
        const user = new User({ email: 'test@example.com', password: 'test123' });
        expect(user.email).toBe('test@example.com');
    });

    test('Peaks parooli hajutama', () => {
        const user = new User({ email: 'test@example.com', password: 'test123' });
        expect(user.password).not.toBe('test123'); // Kontrollime, et parool hajutatakse
    });

    test('Peaks valideerima e-posti formaati', () => {
        const user = new User({ email: 'vale-email', password: 'test123' });
        expect(user.validateSync()).not.toBeNull(); // E-posti formaadi viga
    });
});