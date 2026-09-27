const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'incidents.jsonl');

function ensureReady() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '', 'utf8');
    }
}

function addIncident(incident) {
    ensureReady();
    if (!incident.id) {
        incident.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    }
    const line = JSON.stringify(incident) + '\n';
    fs.appendFileSync(DATA_FILE, line, 'utf8');
    return incident;
}

function getIncidents(limit = 100) {
    ensureReady();
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(l => l.length > 0);
    const incidents = lines.map(l => {
        try {
            return JSON.parse(l);
        } catch(e) {
            return null;
        }
    }).filter(i => i !== null);
    
    return incidents.slice(-limit).reverse();
}

function searchIncidents(keyword) {
    const all = getIncidents(10000);
    if (!keyword) return all;
    const lower = keyword.toLowerCase();
    return all.filter(inc => {
        return (inc.title && inc.title.toLowerCase().includes(lower)) ||
               (inc.description && inc.description.toLowerCase().includes(lower));
    });
}

module.exports = {
    addIncident,
    getIncidents,
    searchIncidents,
    DATA_FILE
};
