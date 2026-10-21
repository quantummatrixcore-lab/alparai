const fs = require('fs');
const { addToQueue, getQueue, markSent, getStats } = require('../src/lib/email/email_queue');

// Clear the queue file for testing
const QUEUE_FILE = 'D:/AlparAi/data/email_queue.jsonl';
if (fs.existsSync(QUEUE_FILE)) {
  fs.unlinkSync(QUEUE_FILE);
}

console.log('Testing Email Queue System...');

// Test addToQueue
const id1 = addToQueue('test1@example.com', 'Test 1', 'Body 1', 'high');
const id2 = addToQueue('test2@example.com', 'Test 2', 'Body 2');
const id3 = addToQueue('test3@example.com', 'Test 3', 'Body 3');

console.log('1. Added 3 emails to queue.');

// Test getQueue
const queue = getQueue();
if (queue.length !== 3) {
  console.error(`FAILED: Expected queue length 3, got ${queue.length}`);
  process.exit(1);
}
console.log('2. getQueue returns 3 pending emails - PASS');

// Test markSent
const marked = markSent(id1);
if (!marked) {
  console.error('FAILED: markSent returned false');
  process.exit(1);
}

const queueAfterMark = getQueue();
if (queueAfterMark.length !== 2) {
  console.error(`FAILED: Expected queue length 2, got ${queueAfterMark.length}`);
  process.exit(1);
}
console.log('3. markSent works correctly - PASS');

// Test getStats
const stats = getStats();
if (stats.pending !== 2 || stats.sent !== 1 || stats.failed !== 0) {
  console.error(`FAILED: Incorrect stats ${JSON.stringify(stats)}`);
  process.exit(1);
}
console.log('4. getStats works correctly - PASS');

console.log('ALL TESTS PASSED (100% GREEN)');
process.exit(0);
