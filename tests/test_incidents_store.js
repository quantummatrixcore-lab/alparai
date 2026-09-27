const fs = require('fs');
const assert = require('assert');
const path = require('path');
const store = require('../src/lib/db/incidents_store.js');

async function runTests() {
    console.log('--- TEST: addIncident ---');
    const newInc = store.addIncident({
        title: 'Test Incident ' + Date.now(),
        description: 'Test Description',
        severity: 'high'
    });
    assert(newInc.id, 'Incident ID should be generated');
    assert.strictEqual(newInc.severity, 'high');
    
    console.log('--- TEST: getIncidents ---');
    const incidents = store.getIncidents(10);
    assert(incidents.length > 0, 'Should return at least 1 incident');
    const found = incidents.find(i => i.id === newInc.id);
    assert(found, 'Should find the newly added incident');
    
    console.log('--- TEST: searchIncidents ---');
    const results = store.searchIncidents('Test Incident');
    assert(results.length > 0, 'Search should find the incident');
    
    console.log('--- TEST: searchIncidents not found ---');
    const emptyResults = store.searchIncidents('NON_EXISTENT_KEYWORD_XYZ');
    assert(emptyResults.length === 0, 'Search should return empty array');
    
    console.log('All tests passed 100% Green');
}

runTests().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
});
