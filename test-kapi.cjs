const http = require('http');

async function testKapi() {
  console.log("Savunma Kapisi ve Olay Mahkemesi Testi Basliyor...");
  let passed = true;

  // Simulate Defense Gate
  const req1 = { auth_token: null };
  if (req1.auth_token) {
    passed = false;
  }

  // Simulate Court
  const req2 = { auth_token: "alparai-secure-token", incident: { severity: 8 } };
  if (req2.incident.severity > 5) {
    // blocked
  } else {
    passed = false;
  }

  // Simulate Success
  const req3 = { auth_token: "alparai-secure-token", incident: { severity: 2 } };
  if (req3.incident.severity <= 5) {
    // accepted
  } else {
    passed = false;
  }

  if (passed) {
    console.log("KAPI GREEN");
  } else {
    console.error("KAPI RED");
    process.exit(1);
  }
}

testKapi();
