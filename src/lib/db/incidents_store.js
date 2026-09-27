const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', '..', 'data', 'incidents.jsonl');

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

function ensureFileExistence(filePath) {
    ensureDirectoryExistence(filePath);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf8');
    }
}

function addIncident(incident) {
    ensureFileExistence(DATA_FILE);
    const entry = JSON.stringify({
        ...incident,
        _addedAt: new Date().toISOString()
    });
    fs.appendFileSync(DATA_FILE, entry + '\n', 'utf8');
}

function getIncidents(limit = 50) {
    ensureFileExistence(DATA_FILE);
    const content = fs.readFileSync(DATA_FILE, 'utf8').trim();
    if (!content) return [];
    
    const lines = content.split('\n');
    const records = lines.filter(line => line).map(line => JSON.parse(line));
    
    return records.slice(-limit);
}

function searchIncidents(keyword) {
    const all = getIncidents(1000000); // practically all for a simple file
    const lowerKeyword = keyword.toLowerCase();
    return all.filter(inc => JSON.stringify(inc).toLowerCase().includes(lowerKeyword));
}

function getStats() {
    const all = getIncidents(1000000);
    return {
        totalRecords: all.length,
        lastAdded: all.length > 0 ? all[all.length - 1]._addedAt : null
    };
}

module.exports = {
    addIncident,
    getIncidents,
    searchIncidents,
    getStats
};
