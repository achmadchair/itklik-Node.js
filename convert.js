const fs = require('fs');

const laravelPath = 'C:\\laragon\\www\\ITKLIK\\resources\\views\\welcome.blade.php';
let content = fs.readFileSync(laravelPath, 'utf8');

// hapus blade syntax
content = content.replace(/@if\s*\([\s\S]*?@else/g, '');
content = content.replace(/@endif/g, '');
content = content.replace(/@vite.*/g, '');
content = content.replace(/\{\{ config\('app.name', 'Laravel'\) \}\}/g, 'ITKLIK Node.js');
content = content.replace(/\{\{ str_replace\('_', '-', app\(\)->getLocale\(\)\) \}\}/g, 'en');

// header login/register
content = content.replace(/@if\s*\(Route::has\('login'\)\)[\s\S]*?@endif/g, '');

// hapus sisa auth
content = content.replace(/@auth[\s\S]*?@else/g, '');
content = content.replace(/@endauth/g, '');


// text laravel -> Node.js
content = content.replace(/Laravel has an incredibly/g, 'Node.js has an incredibly');
content = content.replace(/Let's get started/g, 'Let\\'s get started with Node.js');

// Add vite scripts
content = content.replace('</body>', '  <script type="module" src="/main.js"></script>\n  </body>');

fs.writeFileSync('d:\\ProjectAplikasi\\node.js\\ITKLIK\\index.html', content);
console.log('Done converting welcome.blade.php to index.html');
