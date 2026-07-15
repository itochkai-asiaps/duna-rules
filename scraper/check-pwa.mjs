import fs from 'fs';
const html = fs.readFileSync('C:/Users/user/Desktop/duna-app/index.html', 'utf-8');
console.log('Size:', (html.length/1024).toFixed(0), 'KB');
console.log('Service Worker:', html.includes('serviceWorker'));
console.log('Search:', html.includes('search'));
console.log('Documents:', html.split('"folder"').length - 1);
['01-общие','02-модельные','03-материалы','04-законы'].forEach(f =>
  console.log('  ' + f + ':', html.includes(f))
);
console.log('Tables (Приложение 1):', html.includes('Приложение 1'));
console.log('Last 200 chars:', html.slice(-200));
