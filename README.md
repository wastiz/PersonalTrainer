# Yagutkin Fitness — Landing Page

Personal trainer landing page for Stanislav Yagutkin, Tallinn. Estonian/Russian bilingual, built with Node.js + Express.

## Local Development

```bash
npm install
cp .env.example .env   # then fill in your SMTP credentials
npm run dev            # starts server with --watch on http://localhost:3000
```

## Environment Variables

| Variable        | Description                              | Example                  |
|-----------------|------------------------------------------|--------------------------|
| `SMTP_HOST`     | SMTP server hostname                     | `smtp.gmail.com`         |
| `SMTP_PORT`     | SMTP port (587 for TLS, 465 for SSL)     | `587`                    |
| `SMTP_USER`     | SMTP login / sender email address        | `you@gmail.com`          |
| `SMTP_PASS`     | SMTP password or app-specific password   | `xxxx xxxx xxxx xxxx`    |
| `CONTACT_EMAIL` | Email address to receive form submissions| `yagutkin@gmail.com`     |
| `PORT`          | HTTP port (Railway sets this for you)    | `3000`                   |

### Gmail app password

If using Gmail, generate an **App Password** (Google Account → Security → 2-Step Verification → App passwords). Use that value as `SMTP_PASS`, not your regular Google password.

## Deploying to Railway

1. Push this repo to GitHub (or connect it via Railway's GitHub integration).
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select this repository. Railway detects `package.json` and uses `npm start` automatically (the `Procfile` is also present as a fallback).
4. Open **Variables** in the Railway dashboard and add all the environment variables from the table above.
5. Railway assigns a public URL automatically. Visit it — the site is live.

To use a custom domain: Railway dashboard → **Settings** → **Domains** → **Custom Domain**.

## Project Structure

```
├── server.js          Express server + /api/contact endpoint
├── public/
│   ├── index.html     Single-page landing site
│   ├── css/style.css  All styles
│   ├── js/main.js     i18n, animations, form handling
│   └── locales/
│       ├── ru.json    Russian translations + content
│       └── et.json    Estonian translations + content
├── assets/
│   ├── photos/        Trainer + client transformation photos
│   └── logos/         Partner / gym logos
├── .env.example       Required environment variables template
└── Procfile           Railway / Heroku process declaration
```

## Adding / Editing Content

All copy lives in `public/locales/ru.json` and `public/locales/et.json`. Edit the values there — no HTML changes needed. Services, stats, and testimonials are arrays rendered by JS from the locale file.

Photos go in `assets/photos/`. To replace a photo, swap the file at the same path.
