const fs = require('fs');
const path = require('path');

// Define paths to check
const pathsToCheck = [
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, 'client/dist/index.html'),
  path.join(__dirname, '/client/dist'),
  path.join(__dirname, '/client/dist/index.html'),
  path.join(__dirname, './client/dist'),
  path.join(__dirname, './client/dist/index.html'),
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, '../client/dist/index.html')
];

console.log('Current directory:', __dirname);
console.log('Parent directory:', path.resolve(__dirname, '..'));

// Check each path
pathsToCheck.forEach(pathToCheck => {
  try {
    const stats = fs.statSync(pathToCheck);
    console.log(`✅ Path exists: ${pathToCheck}`);
    console.log(`   Type: ${stats.isDirectory() ? 'Directory' : 'File'}`);
  } catch (err) {
    console.log(`❌ Path does not exist: ${pathToCheck}`);
    console.log(`   Error: ${err.message}`);
  }
});

// List directory contents if they exist
const dirsToList = [
  __dirname,
  path.join(__dirname, 'client'),
  path.join(__dirname, 'api'),
  path.join(__dirname, '../client'),
  path.join(__dirname, '../client/dist')
];

dirsToList.forEach(dir => {
  try {
    const files = fs.readdirSync(dir);
    console.log(`\nContents of ${dir}:`);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        const stats = fs.statSync(fullPath);
        console.log(`  ${file} (${stats.isDirectory() ? 'dir' : 'file'})`);
      } catch (err) {
        console.log(`  ${file} (error: ${err.message})`);
      }
    });
  } catch (err) {
    console.log(`\nCould not list contents of ${dir}: ${err.message}`);
  }
}); 