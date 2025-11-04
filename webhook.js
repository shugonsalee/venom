const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors'); // <- added

const app = express();

// === CORS configuration ===
// Development: allow your local frontend origin so the browser preflight (OPTIONS) will succeed.
// You can change origin to '*' to allow all origins (not recommended for production).
app.use(cors({
  origin: 'http://127.0.0.1:5500', // allow your dev server
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Also explicitly respond to OPTIONS for any route (safety)
app.options('*', cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Load credentials from Render Environment Variables
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

// Initialize Telegram bot (no polling)
const bot = new TelegramBot(botToken);

// Webhook route — this receives POST requests
app.post('/webhook', async (req, res) => {
  // Log method and origin so you can see preflight vs actual POST in the logs
  console.log(`Incoming ${req.method} request to /webhook from origin: ${req.get('Origin')}`);
  console.log('Request body:', req.body);

  const { email, data1 } = req.body || {};

  // Validate briefly
  if (!email || !data1) {
    console.warn('Missing email or data1 in request body');
    return res.status(400).send('❌ Missing email or data1');
  }

  const message = `📩 New Submission:\n\nEmail: ${email}\ndata1: ${data1}`;

  try {
    await bot.sendMessage(chatId, message);
    res.status(200).send('✅ Data received and sent to Telegram');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('❌ Error sending data');
  }
});

// Optional route to check if the server is running
app.get('/', (req, res) => {
  res.send('🚀 Webhook server is live!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Optional: set webhook automatically
  const webhookUrl = `https://web-venom-rend.onrender.com/webhook`;
  bot.setWebHook(webhookUrl);
  console.log(`🌐 Webhook set to: ${webhookUrl}`);
});
