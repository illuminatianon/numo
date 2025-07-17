#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test cases with expected values (verified against our implementation)
const testCases = [
  {
    text: "hello",
    expected: {
      ordinal: 52,        // h(8) + e(5) + l(12) + l(12) + o(15) = 52
      alpha_qabbala: 97,  // h(17) + e(14) + l(21) + l(21) + o(24) = 97
      reduction: 25,      // h(8) + e(5) + l(3) + l(3) + o(6) = 25
      qwerty: 116        // h(26) + e(13) + l(29) + l(29) + o(19) = 116
    }
  },
  {
    text: "world",
    expected: {
      ordinal: 72,        // w(23) + o(15) + r(18) + l(12) + d(4) = 72
      alpha_qabbala: 117, // w(32) + o(24) + r(27) + l(21) + d(13) = 117
      reduction: 27,      // w(5) + o(6) + r(9) + l(3) + d(4) = 27
      qwerty: 97         // w(12) + o(19) + r(14) + l(29) + d(23) = 97
    }
  },
  {
    text: "test",
    expected: {
      ordinal: 64,        // t(20) + e(5) + s(19) + t(20) = 64
      alpha_qabbala: 100, // t(29) + e(14) + s(28) + t(29) = 100
      reduction: 10,      // t(2) + e(5) + s(1) + t(2) = 10
      qwerty: 65         // t(15) + e(13) + s(22) + t(15) = 65
    }
  },
  {
    text: "abc",
    expected: {
      ordinal: 6,         // a(1) + b(2) + c(3) = 6
      alpha_qabbala: 33,  // a(10) + b(11) + c(12) = 33
      reduction: 6,       // a(1) + b(2) + c(3) = 6
      qwerty: 87         // a(21) + b(34) + c(32) = 87
    }
  },
  {
    text: "xyz",
    expected: {
      ordinal: 75,        // x(24) + y(25) + z(26) = 75
      alpha_qabbala: 102, // x(33) + y(34) + z(35) = 102
      reduction: 21,      // x(6) + y(7) + z(8) = 21
      qwerty: 77         // x(31) + y(16) + z(30) = 77
    }
  }
];

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function runTest(testCase) {
  console.log(`${colors.blue}Testing: "${testCase.text}"${colors.reset}`);
  
  // Create temporary input file
  const inputFile = path.join(__dirname, 'temp_input.txt');
  const outputFile = path.join(__dirname, 'temp_output.csv');
  
  fs.writeFileSync(inputFile, testCase.text);
  
  try {
    // Run the CLI with all ciphers
    execSync(`node ../src/index.js --ciphers=all "${inputFile}" "${outputFile}"`, {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    // Read and parse the output
    const csvContent = fs.readFileSync(outputFile, 'utf8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    const values = lines[1].split(',');
    
    // Extract cipher results (skip the first column which is the text)
    const results = {};
    for (let i = 1; i < headers.length; i++) {
      results[headers[i]] = parseInt(values[i]);
    }
    
    // Compare with expected values
    let allPassed = true;
    for (const [cipher, expectedValue] of Object.entries(testCase.expected)) {
      const actualValue = results[cipher];
      if (actualValue === expectedValue) {
        console.log(`  ${colors.green}✓${colors.reset} ${cipher}: ${actualValue}`);
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${cipher}: expected ${expectedValue}, got ${actualValue}`);
        allPassed = false;
      }
    }
    
    // Clean up
    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);
    
    return allPassed;
    
  } catch (error) {
    console.log(`  ${colors.red}✗ Error running test: ${error.message}${colors.reset}`);
    
    // Clean up on error
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    
    return false;
  }
}

function main() {
  console.log(`${colors.yellow}Running Cipher Tests${colors.reset}\n`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    if (runTest(testCase)) {
      passedTests++;
    }
    console.log('');
  }
  
  console.log(`${colors.yellow}Test Results:${colors.reset}`);
  console.log(`Total: ${totalTests}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}Some tests failed.${colors.reset}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testCases, runTest };
