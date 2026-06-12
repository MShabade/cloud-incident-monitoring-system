const fs = require('fs');
const path = require('path');

const serverRoot = path.join(__dirname, '..');
const dest = path.join(serverRoot, '../client/vendor/chart.umd.min.js');
const distDir = path.join(serverRoot, 'node_modules/chart.js/dist');

fs.mkdirSync(path.dirname(dest), { recursive: true });

const paths = [
  path.join(distDir, 'chart.umd.min.js'),
  path.join(distDir, 'chart.umd.js')
].filter((p) => fs.existsSync(p));

if (!paths.length) {
  console.error('Chart.js missing — run: npm install');
  process.exit(1);
}

fs.copyFileSync(paths[0], dest);
console.log('Chart.js copied to client/vendor/');
