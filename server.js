require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

app.post('/api/contact', async (req, res) => {
  const { name, contact, service, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!contact || !contact.trim()) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
  if (!emailRegex.test(contact.trim()) && !phoneRegex.test(contact.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email or phone number' });
  }

  if (name.trim().length > 200 || contact.trim().length > 200) {
    return res.status(400).json({ error: 'Input too long' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const safeName = escapeHtml(name.trim());
    const safeContact = escapeHtml(contact.trim());
    const safeService = escapeHtml((service || '').trim()) || '—';
    const safeMessage = escapeHtml((message || '').trim()) || '—';

    await transporter.sendMail({
      from: `"Yagutkin Fitness" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'stanislavjagutkin@gmail.com',
      subject: `New booking request — ${safeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; padding: 32px;">
          <h2 style="color: #111; margin-top: 0;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #555; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; color: #555;">Contact</td><td style="padding: 8px 0; font-weight: 600;">${safeContact}</td></tr>
            <tr><td style="padding: 8px 0; color: #555;">Service</td><td style="padding: 8px 0;">${safeService}</td></tr>
            <tr><td style="padding: 8px 0; color: #555; vertical-align: top;">Message</td><td style="padding: 8px 0;">${safeMessage.replace(/\n/g, '<br>')}</td></tr>
          </table>
        </div>
      `,
      text: `New booking request\n\nName: ${name.trim()}\nContact: ${contact.trim()}\nService: ${(service || '').trim() || '—'}\nMessage: ${(message || '').trim() || '—'}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
