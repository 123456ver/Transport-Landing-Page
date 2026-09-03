const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let isReady = false;

client.on('qr', (qr) => {
  console.log('📱 Scan this QR code with WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  isReady = true;
  console.log('✅ WhatsApp Business is ready!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Auth failure:', msg);
});

client.on('disconnected', () => {
  isReady = false;
  console.log('⚠️ WhatsApp disconnected');
});

client.initialize();

app.get('/status', (req, res) => {
  res.json({ ready: isReady, status: isReady ? 'connected' : 'disconnected' });
});

app.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!isReady) return res.status(503).json({ error: 'WhatsApp not ready. Please scan QR code first.' });
    if (!to || !message) return res.status(400).json({ error: 'Phone number and message required' });

    let formattedNumber = to.replace(/\D/g, '');
    if (!formattedNumber.startsWith('254')) formattedNumber = '254' + formattedNumber.replace(/^0/, '');

    await client.sendMessage(formattedNumber + '@c.us', message);
    res.json({ success: true, sentTo: formattedNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/notify', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!isReady) return res.status(503).json({ error: 'WhatsApp not ready' });

    let formattedNumber = to.replace(/\D/g, '');
    if (!formattedNumber.startsWith('254')) formattedNumber = '254' + formattedNumber.replace(/^0/, '');

    await client.sendMessage(formattedNumber + '@c.us', message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📞 WhatsApp service running on port ${PORT}`);
});
