const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const files = {};
const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'models') walk(file); }
    else if (!file.endsWith('.map')) files['/' + path.relative(root, file)] = file;
  }
};
walk(root);
const code = fs.readFileSync(path.join(__dirname, 'browser-fixtures.js'), 'utf8').replace('/* BUILD_FILES */ {}', JSON.stringify(files));
const output = path.resolve(__dirname, '../../.playwright-mcp/browser-fixtures.js');
fs.writeFileSync(output, code);
console.log(`Prepared ${output} for the connected Playwright tool. API data is mocked.`);
