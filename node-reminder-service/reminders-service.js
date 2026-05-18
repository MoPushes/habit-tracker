// reminders-service.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const cron = require('node-cron');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let reminders = [];
const sentToday = new Set();

wss.on('connection', (ws) => {
  console.log('✅ Client connected to WebSocket');
  
  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastNotification(reminder) {
  const message = JSON.stringify({
    type: 'NOTIFICATION',
    reminder: {
      id: reminder.id,
      text: reminder.text,
      time: reminder.time,
      type: reminder.type,
      triggeredAt: new Date().toISOString()
    }
  });

  let clientsConnected = 0;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      clientsConnected++;
    }
  });
  console.log(`📡 Broadcast sent to ${clientsConnected} client(s)`);
}

function sendNotification(reminder) {
  console.log(`🔔 NOTIFICATION SENT: "${reminder.text}" (Type: ${reminder.type})`);
  console.log(`⏰ Scheduled: ${reminder.time} | Triggered: ${new Date().toLocaleTimeString()}`);
  console.log(`📡 WebSocket server ready for real-time notifications`);
}

cron.schedule('* * * * *', () => {
  const now = new Date();
  const currentMin = now.getMinutes();
  const currentHour = now.getHours();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  console.log(`[Scheduler] Checking for due reminders...`);

  reminders.forEach(reminder => {
    if (!reminder.active) return;

    const [targetHour, targetMin] = reminder.time.split(':').map(Number);
    let triggerHour = targetHour;
    let triggerMin = targetMin;

    if (reminder.type === 'bad') {
      triggerMin -= 5;
      if (triggerMin < 0) {
        triggerMin += 60;
        triggerHour = (triggerHour - 1 + 24) % 24;
      }
    }

    const triggerDate = new Date(currentYear, currentMonth - 1, currentDay, triggerHour, triggerMin, 0);
    const timeDiffMs = now - triggerDate;

    if (timeDiffMs >= 0 && timeDiffMs <= 60000) {
      const reminderKey = `${reminder.id}-${currentDay}`;
      
      if (!sentToday.has(reminderKey)) {
        sendNotification(reminder);
        broadcastNotification(reminder);
        sentToday.add(reminderKey);
        
        setTimeout(() => sentToday.clear(), 24 * 60 * 60 * 1000);
      }
    }
  });
});
app.put('/reminders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, time, type, description } = req.body;
  
  const reminderIndex = reminders.findIndex(r => r.id === id);
  
  if (reminderIndex === -1) {
    return res.status(404).json({ error: 'Reminder not found' });
  }
  
  const existing = reminders[reminderIndex];
  
  const updatedReminder = {
    id: existing.id,
    userId: existing.userId,
    text: text ?? existing.text,       
    time: time ?? existing.time,
    type: type ?? existing.type,       // CRITICAL: Ensure 'type' exists
    description: description ?? existing.description, // CRITICAL: Ensure 'description' exists
    active: existing.active,
    createdAt: existing.createdAt,
    updatedAt: new Date()
  };
  
  reminders[reminderIndex] = updatedReminder;
  
  console.log(`✏️ Updated reminder:`, updatedReminder);

  res.json(updatedReminder); // Send the full object back
});

app.post('/reminders', (req, res) => {
  const { userId, text, time, type, description } = req.body;
  
  // Validation
  if (!time || !text) return res.status(400).json({ error: "Time and text required" });
  
  const newReminder = {
    id: Date.now(),
    userId,
    text,
    time, // Format "HH:MM"
    type: type || 'good',
    description: description || '',
    active: true,
    createdAt: new Date()
  };

  reminders.push(newReminder);
  console.log(`✅ Created reminder: ${text} at ${time} (${type})`);
  
  res.status(201).json(newReminder);
});

app.get('/reminders', (req, res) => {
  const userId = req.query.userId;
  const filtered = userId ? reminders.filter(r => r.userId === userId) : reminders;
  res.json(filtered);
});

app.delete('/reminders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  reminders = reminders.filter(r => r.id !== id);
  res.json({ message: "Reminder deleted" });
});
app.get('/health', (req, res) => res.json({ status: 'ok', scheduler: 'running' }));


app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Reminder Service running on port ${PORT}`);
  console.log(`⏰ Scheduler active: Checks every minute for due reminders.`)
});
