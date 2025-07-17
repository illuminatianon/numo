#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Cipher builder utilities
function buildSequentialCipher(chars, startValue = 1) {
  const cipher = {};
  for (let i = 0; i < chars.length; i++) {
    cipher[chars[i]] = startValue + i;
  }
  return cipher;
}

function buildCipherFromMapping(mapping) {
  const cipher = {};
  Object.entries(mapping).forEach(([chars, value]) => {
    if (typeof chars === 'string' && chars.length > 1) {
      // Handle string of characters with same value
      for (const char of chars) {
        cipher[char] = value;
      }
    } else {
      cipher[chars] = value;
    }
  });
  return cipher;
}

function mergeCiphers(...ciphers) {
  return Object.assign({}, ...ciphers);
}

// Cipher definitions
const ciphers = {
  alpha_qabbala: mergeCiphers(
    { '0': 0 }, // Special case: 0 = 0
    buildSequentialCipher('abcdefghijklmnopqrstuvwxyz', 10), // A-Z = 10-35
    buildSequentialCipher('123456789', 1) // 1-9 = 1-9
  ),

  qwerty: mergeCiphers(
    buildSequentialCipher('1234567890', 1), // Number row = 1-10
    buildSequentialCipher('qwertyuiop', 11), // Top letter row = 11-20
    buildSequentialCipher('asdfghjkl', 21), // Middle letter row = 21-29
    buildSequentialCipher('zxcvbnm', 30) // Bottom letter row = 30-36
  ),

  ordinal: mergeCiphers(
    buildSequentialCipher('abcdefghijklmnopqrstuvwxyz', 1)
  ),

  reduction: mergeCiphers(
    buildSequentialCipher('abcdefghi', 1),
    buildSequentialCipher('jklmnopqr', 1),
    buildSequentialCipher('stuvwxyz', 1)
  )
};

function calculateCipherValue(text, cipher) {
  let value = 0;
  for (const char of text.toLowerCase()) {
    if (cipher[char] !== undefined) {
      value += cipher[char];
    }
  }
  return value;
}

function processLine(line, selectedCiphers) {
  // Remove content in [] but keep the brackets for output
  const cleanLine = line.replace(/\[.*?\]/g, '');
  
  const results = { original: line };
  selectedCiphers.forEach(cipherName => {
    if (ciphers[cipherName]) {
      results[cipherName] = calculateCipherValue(cleanLine, ciphers[cipherName]);
    }
  });
  
  return results;
}

program
  .name('numo')
  .description('Calculate numerology ciphers over text files')
  .version('1.0.0')
  .option('-c, --ciphers <ciphers>', 'comma-separated list of ciphers', 'alpha_qabbala')
  .argument('<input>', 'input text file')
  .argument('<output>', 'output CSV file')
  .action((input, output, options) => {
    let selectedCiphers;

    if (options.ciphers === 'all') {
      selectedCiphers = Object.keys(ciphers);
    } else {
      selectedCiphers = options.ciphers.split(',').map(c => c.trim());

      // Validate ciphers
      const invalidCiphers = selectedCiphers.filter(c => !ciphers[c]);
      if (invalidCiphers.length > 0) {
        console.error(`Unknown ciphers: ${invalidCiphers.join(', ')}`);
        console.error(`Available ciphers: ${Object.keys(ciphers).join(', ')}, all`);
        process.exit(1);
      }
    }
    
    // Read input file
    const inputText = fs.readFileSync(input, 'utf8');
    const lines = inputText.split('\n');
    
    // Process lines
    const results = lines.map(line => processLine(line, selectedCiphers));
    
    // Generate CSV
    const headers = ['line', ...selectedCiphers];
    const csvLines = [headers.join(',')];
    
    results.forEach(result => {
      const row = [
        `"${result.original.replace(/"/g, '""')}"`,
        ...selectedCiphers.map(cipher => result[cipher] || 0)
      ];
      csvLines.push(row.join(','));
    });
    
    // Write output
    fs.writeFileSync(output, csvLines.join('\n'));
    console.log(`Processed ${lines.length} lines to ${output}`);
  });

program.parse();

