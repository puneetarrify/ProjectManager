const fs = require('fs');
const files = [
  'server/routes/projects.js',
  'server/routes/tasks.js',
  'public/js/app.js',
  'public/js/api.js',
  'public/js/components/dashboard.js',
  'public/js/components/modal.js',
  'public/js/components/projectDetail.js'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.split('\\\\${').join('${');
  fs.writeFileSync(f, c);
});
console.log('Fixed');
