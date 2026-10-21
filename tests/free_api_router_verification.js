'use strict';

/**
 * AlparAI Epistemic Router Verification Test Runner
 * T0/T1 Dogrulama Senaryolari
 */

import {
  selectProviderChain,
  tripProvider,
  resetProvider,
  routeAndExecute,
  listProviders,
  PROVIDERS
} from '../src/ai/free_api_router.js';

async function runTests() {
  const report = {
    testSuite: 'AlparAI Free API Router Epistemic Verification',
    timestamp: new Date().toISOString(),
    steps: []
  };

  console.log('=== TEST 1: selectProviderChain(FAST_NLI_FACT_CHECK) ===');
  resetProvider('groq');
  const initialChain = selectProviderChain('FAST_NLI_FACT_CHECK');
  console.log('Initial Chain:', initialChain);
  const test1Passed = Array.isArray(initialChain) &&
    initialChain[0] === 'groq' &&
    initialChain[1] === 'cerebras' &&
    initialChain[2] === 'google_ai_studio';

  report.steps.push({
    step: 1,
    name: "selectProviderChain('FAST_NLI_FACT_CHECK')",
    result: initialChain,
    passed: test1Passed,
    expectedPrimary: 'groq'
  });

  if (!test1Passed) {
    throw new Error('Test 1 basarisiz: Beklenen baslangic zinciri alinamadi.');
  }

  console.log('\n=== TEST 2: tripProvider(groq, 429_RATE_LIMIT) & Automatic Failover ===');
  const tripResult = tripProvider('groq', '429_RATE_LIMIT', 60000);
  console.log('Trip Result:', tripResult);
  const failoverChain = selectProviderChain('FAST_NLI_FACT_CHECK');
  console.log('Failover Chain:', failoverChain);

  const test2Passed = Array.isArray(failoverChain) &&
    !failoverChain.includes('groq') &&
    failoverChain[0] === 'cerebras' &&
    failoverChain[1] === 'google_ai_studio';

  report.steps.push({
    step: 2,
    name: "tripProvider('groq', '429_RATE_LIMIT') -> failover check",
    tripResult,
    failoverChain,
    passed: test2Passed,
    expectedPrimaryAfterTrip: 'cerebras'
  });

  if (!test2Passed) {
    throw new Error('Test 2 basarisiz: 429 sonrasi cerebras/google_ai_studio failover gerceklesmedi.');
  }

  console.log('\n=== TEST 3: routeAndExecute(DEEP_EPISTEMIC_REASONING) ===');
  const executionResult = await routeAndExecute({
    taskType: 'DEEP_EPISTEMIC_REASONING',
    prompt: 'Epistemik kanit dogrulamasi'
  });
  console.log('Execution Result:', JSON.stringify(executionResult, null, 2));

  const test3Passed = executionResult.ok === true &&
    executionResult.mode === 'DETERMINISTIC_LOCAL_READY' &&
    executionResult.estimatedCost === '$0.00' &&
    executionResult.zeroHallucinationCompliant === true &&
    executionResult.primaryProvider === 'sambanova' &&
    typeof executionResult.seal === 'string' &&
    executionResult.seal.length === 64;

  report.steps.push({
    step: 3,
    name: "routeAndExecute({ taskType: 'DEEP_EPISTEMIC_REASONING', prompt: 'Epistemik kanit dogrulamasi' })",
    result: executionResult,
    passed: test3Passed
  });

  if (!test3Passed) {
    throw new Error('Test 3 basarisiz: Deterministik epistemik sonuc beklenen kriterleri saglamadi.');
  }

  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
  console.log('T0/T1 Test Report Summary:');
  console.log(JSON.stringify(report, null, 2));
}

runTests().catch((err) => {
  console.error('Test Execution Failed:', err);
  process.exit(1);
});
