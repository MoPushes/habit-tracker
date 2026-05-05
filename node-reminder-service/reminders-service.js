// reminders-service.js
const http = require('http');

const reminders = [
  { id: 1, text: 'Go for a walk' },
  { id: 2, text: 'Drink water' },
  { id: 3, text: 'Read a book page' },
];

const PORT = process.env.PORT || 3000;

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.url === '/reminders' && req.method === 'GET') {
    return sendJson(res, 200, reminders);
  }

  if (req.url === '/health' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok' });
  }

  return sendJson(res, 404, { error: 'Not Found', path: req.url });
});

server.listen(PORT, () => {
  console.log(`Reminder service running on port ${PORT}`);
});
