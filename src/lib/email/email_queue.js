const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.resolve('D:/AlparAi/data/email_queue.jsonl');

function ensureFile() {
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, '', 'utf8');
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function addToQueue(to, subject, body, priority = 'normal') {
  ensureFile();
  const email = {
    id: generateId(),
    to,
    subject,
    body,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  fs.appendFileSync(QUEUE_FILE, JSON.stringify(email) + '\n', 'utf8');
  return email.id;
}

function getQueue() {
  ensureFile();
  const content = fs.readFileSync(QUEUE_FILE, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => JSON.parse(line)).filter(email => email.status === 'pending');
}

function markSent(emailId) {
  ensureFile();
  const content = fs.readFileSync(QUEUE_FILE, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const emails = lines.map(line => JSON.parse(line));
  
  let found = false;
  for (let i = 0; i < emails.length; i++) {
    if (emails[i].id === emailId) {
      emails[i].status = 'sent';
      emails[i].sentAt = new Date().toISOString();
      found = true;
    }
  }
  
  if (found) {
    fs.writeFileSync(QUEUE_FILE, emails.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  }
  return found;
}

function getStats() {
  ensureFile();
  const content = fs.readFileSync(QUEUE_FILE, 'utf8');
  const stats = { pending: 0, sent: 0, failed: 0 };
  if (!content.trim()) return stats;
  
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  lines.forEach(line => {
    try {
      const email = JSON.parse(line);
      if (stats[email.status] !== undefined) {
        stats[email.status]++;
      }
    } catch (e) {}
  });
  
  return stats;
}

module.exports = {
  addToQueue,
  getQueue,
  markSent,
  getStats
};
