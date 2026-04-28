// reminders-service.js
const http = require('http');

const reminders = [
  { id: 1, text: "Go for a walk" },
  { id: 2, text: "Drink water" },
  { id: 3, text: "Read a book page" }
];

const server = http.createServer((req, res) => {
  if (req.url === '/reminders' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reminders));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Reminder service running on port 3000');
});