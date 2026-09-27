const fs = require('fs');
const path = require('path');
const store = require('../src/lib/db/incidents_store');

const DATA_FILE = path.join(__dirname, '..', 'data', 'incidents.jsonl');

function runTests() {
    try {
        // Cleanup before test
        if (fs.existsSync(DATA_FILE)) {
            fs.unlinkSync(DATA_FILE);
        }

        console.log('Testing addIncident...');
        store.addIncident({ id: 1, message: 'Server crash' });
        store.addIncident({ id: 2, message: 'DB timeout' });
        store.addIncident({ id: 3, message: 'Auth failure' });

        console.log('Testing getIncidents...');
        const incidents = store.getIncidents(2);
        if (incidents.length !== 2) throw new Error('Expected 2 incidents, got ' + incidents.length);
        if (incidents[1].message !== 'Auth failure') throw new Error('Expected Auth failure, got ' + incidents[1].message);

        console.log('Testing searchIncidents...');
        const searchRes = store.searchIncidents('timeout');
        if (searchRes.length !== 1) throw new Error('Expected 1 search result, got ' + searchRes.length);
        if (searchRes[0].id !== 2) throw new Error('Expected DB timeout id to be 2, got ' + searchRes[0].id);

        console.log('Testing getStats...');
        const stats = store.getStats();
        if (stats.totalRecords !== 3) throw new Error('Expected 3 total records, got ' + stats.totalRecords);

        console.log('All tests PASSED 100% Green');
        process.exit(0);
    } catch (e) {
        console.error('Test FAILED:', e);
        process.exit(1);
    }
}

runTests();
