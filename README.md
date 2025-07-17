# Numo - Numerology Cipher Calculator CLI

A command-line tool for calculating numerology cipher values over text files. Numo processes text files line by line and outputs the calculated cipher values in CSV format.

## Features

- **Multiple Cipher Support**: Currently supports Alphanumeric Qabbala and QWERTY keyboard layout ciphers
- **Bracket Filtering**: Ignores content within square brackets `[]` during calculation (but preserves them in output)
- **CSV Output**: Clean, structured output format for further analysis
- **Extensible Design**: Easy to add new cipher systems

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- pnpm (recommended) or npm

### Install Dependencies
```bash
pnpm install
```

### Global Installation (Optional)
To use `numo` command globally:
```bash
pnpm link
```

Or install directly from the project directory:
```bash
npm install -g .
```

## Usage

### Basic Command Structure
```bash
numo [options] <input-file> <output-file>
```

### Options
- `-c, --ciphers <ciphers>`: Comma-separated list of ciphers to use (default: `alpha_qabbala`)
- `-h, --help`: Display help information
- `-V, --version`: Display version number

### Examples

#### Single Cipher (Alphanumeric Qabbala)
```bash
numo data/on_purpose_numo.md output.csv
```

#### Multiple Ciphers
```bash
numo --ciphers=alpha_qabbala,qwerty data/on_purpose_numo.md output.csv
```

#### Using Short Option
```bash
numo -c alpha_qabbala,qwerty input.txt results.csv
```

## Available Ciphers

### 1. Alphanumeric Qabbala (`alpha_qabbala`)
Traditional alphanumeric cipher where:
- 0 = 0 (special case)
- A-Z = 10-35
- 1-9 = 1-9

### 2. QWERTY Keyboard Layout (`qwerty`)
Cipher based on QWERTY keyboard layout:
- Numbers row: 1-9,0 = 1-10
- Top letter row: Q-P = 11-20
- Middle letter row: A-L = 21-29
- Bottom letter row: Z-M = 30-36

## Input File Format

- Plain text files
- One line per calculation
- Content within square brackets `[]` is ignored during calculation but preserved in output
- Supports UTF-8 encoding


**Note**: Content within square brackets `[...]` is ignored during cipher calculation but preserved in the output. In the example above, the line `[Intro – trembling, half-whispered]` would have a cipher value of 0 because the bracketed content is excluded from calculation.

## Output Format

CSV format with columns:
- `line`: Original line text (quoted and escaped)
- `[cipher_name]`: Calculated value for each specified cipher

### Adding New Ciphers

The project includes fluent cipher builder utilities to make defining new ciphers easier. To add a new cipher, edit `src/index.js` and use the builder functions:

```javascript
const ciphers = {
  // Existing ciphers...

  your_cipher_name: mergeCiphers(
    { '0': 0 }, // Special mappings
    buildSequentialCipher('abcdefghijklmnopqrstuvwxyz', 10), // A-Z = 10-35
    buildSequentialCipher('123456789', 1) // 1-9 = 1-9
  ),

  // Or for more complex mappings:
  custom_cipher: buildCipherFromMapping({
    'aeiou': 5,     // All vowels = 5
    'bcdfg': 10,    // These consonants = 10
    'h': 15,        // H = 15
    // etc...
  })
};
```

**Builder Functions:**
- `buildSequentialCipher(chars, startValue)`: Maps characters to sequential values
- `buildCipherFromMapping(mapping)`: Maps characters/strings to specific values
- `mergeCiphers(...ciphers)`: Combines multiple cipher objects

### Testing

Test the CLI with the provided sample files:

```bash
# Basic test with default cipher
pnpm test

# Multi-cipher test
pnpm test-multi

# Manual testing with example file
node src/index.js data/example.txt example_output.csv

# Manual testing with multiple ciphers
node src/index.js --ciphers=alpha_qabbala,qwerty data/example.txt example_output.csv
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**Command not found**: If `numo` command is not recognized after global installation, ensure your npm global bin directory is in your PATH.

**File not found**: Ensure input file paths are correct and files exist.

**Invalid cipher**: Check that cipher names are spelled correctly and exist in the available ciphers list.

### Getting Help

Run `numo --help` for command-line help, or check the examples in this README.
