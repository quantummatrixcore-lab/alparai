const fs = require('fs');
const { addToQueue } = require('../src/lib/email/email_queue');

const data = JSON.parse(fs.readFileSync('D:/AlparAi/data/outbound_campaign.json', 'utf8'));

data.campaigns.slice(0, 3).forEach(target => {
  const emailTo = `${target.company.toLowerCase().replace(/\s/g, '')}@example.com`;
  const subject = `AI Compliance for ${target.company}`;
  const body = `Hello ${target.company},\nWe noticed your trigger: ${target.trigger}. Let's talk about AlparAi.`;
  
  addToQueue(emailTo, subject, body, 'high');
  console.log(`Added email for ${target.company} to queue.`);
});
